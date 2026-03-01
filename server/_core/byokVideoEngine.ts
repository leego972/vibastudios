/**
 * BYOK (Bring Your Own Key) Video Engine
 * 
 * Supports ALL major video generation APIs:
 * - Runway ML (Gen-3, Gen-4) — key starts with "key_"
 * - OpenAI Sora — key starts with "sk-"
 * - Replicate (Wan2.1, etc.) — key starts with "r8_"
 * - fal.ai (HunyuanVideo, Veo3, LTX-Video) — key starts with various
 * - Luma AI (Dream Machine) — key starts with "luma-"
 * - Hugging Face (free inference API) — key starts with "hf_"
 * - Pollinations.ai (FREE, no user key needed) — platform key
 * 
 * Each provider has its own generate function.
 * The engine selects the provider based on user preference or available keys.
 * If NO keys are configured, Pollinations is used as the free fallback.
 */

import { ENV } from "./env";

// ─── Types ───

export type VideoProvider = "runway" | "openai" | "replicate" | "fal" | "luma" | "huggingface" | "pollinations";

export interface UserApiKeys {
  openaiKey?: string | null;
  runwayKey?: string | null;
  replicateKey?: string | null;
  falKey?: string | null;
  lumaKey?: string | null;
  hfToken?: string | null;
  preferredProvider?: string | null;
}

export interface VideoGenerationRequest {
  prompt: string;
  imageUrl?: string;       // Reference image for image-to-video
  duration?: number;       // Duration in seconds (default 5)
  aspectRatio?: string;    // "16:9", "9:16", "1:1" (default "16:9")
  resolution?: string;     // "720p", "1080p" (default "720p")
}

export interface VideoGenerationResult {
  provider: VideoProvider;
  videoUrl: string;        // Direct URL to the generated video
  jobId?: string;          // Provider-specific job ID
  durationSeconds?: number;
  thumbnailUrl?: string;
}

// ─── Provider Detection ───

function getAvailableProviders(keys: UserApiKeys): VideoProvider[] {
  const providers: VideoProvider[] = [];
  if (keys.runwayKey) providers.push("runway");
  if (keys.openaiKey) providers.push("openai");
  if (keys.replicateKey) providers.push("replicate");
  if (keys.falKey) providers.push("fal");
  if (keys.lumaKey) providers.push("luma");
  if (keys.hfToken) providers.push("huggingface");
  // Pollinations is ALWAYS available as the free fallback
  providers.push("pollinations");
  return providers;
}

function selectProvider(keys: UserApiKeys): VideoProvider {
  // Use preferred provider if key is available
  if (keys.preferredProvider) {
    const pref = keys.preferredProvider as VideoProvider;
    if (pref === "pollinations") return "pollinations"; // Always available
    const available = getAvailableProviders(keys);
    if (available.includes(pref)) return pref;
  }

  // Check for platform-level keys (Runway, OpenAI) as first priority
  if (keys.runwayKey || ENV.runwayApiKey) return "runway";
  if (keys.openaiKey || ENV.openaiApiKey) return "openai";

  // Then user BYOK keys in priority order
  const priority: VideoProvider[] = ["fal", "replicate", "luma", "huggingface"];
  const available = getAvailableProviders(keys);
  for (const p of priority) {
    if (available.includes(p) && p !== "pollinations") return p;
  }

  // Ultimate fallback: Pollinations (always free, always available)
  return "pollinations";
}

// ─── Runway ML ───

async function generateWithRunway(key: string, req: VideoGenerationRequest): Promise<VideoGenerationResult> {
  const ratio = req.aspectRatio === "9:16" ? "720:1280" : req.aspectRatio === "1:1" ? "720:720" : "1280:720";
  const duration = Math.min(req.duration || 5, 10);

  const body: any = {
    model: "gen4_turbo",
    ratio,
    duration,
  };

  if (req.imageUrl) {
    body.promptImage = req.imageUrl;
    body.promptText = req.prompt;
  } else {
    body.promptText = req.prompt;
  }

  const endpoint = req.imageUrl
    ? "https://api.dev.runwayml.com/v1/image_to_video"
    : "https://api.dev.runwayml.com/v1/image_to_video";

  const createResp = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
      "X-Runway-Version": "2024-11-06",
    },
    body: JSON.stringify(body),
  });

  if (!createResp.ok) {
    const errText = await createResp.text();
    throw new Error(`Runway API error ${createResp.status}: ${errText}`);
  }

  const createData = await createResp.json() as any;
  const taskId = createData.id;
  console.log(`[BYOK:Runway] Task created: ${taskId}`);

  const videoUrl = await pollRunwayTask(key, taskId);
  return { provider: "runway", videoUrl, jobId: taskId, durationSeconds: duration };
}

async function pollRunwayTask(key: string, taskId: string, maxWaitMs = 600000): Promise<string> {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    await new Promise(r => setTimeout(r, 5000));

    const resp = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
      headers: {
        "Authorization": `Bearer ${key}`,
        "X-Runway-Version": "2024-11-06",
      },
    });

    if (!resp.ok) continue;
    const data = await resp.json() as any;

    if (data.status === "SUCCEEDED") {
      const videoUrl = data.output?.[0] || data.artifactUrl;
      if (!videoUrl) throw new Error("Runway task succeeded but no video URL found");
      return videoUrl;
    }
    if (data.status === "FAILED") {
      throw new Error(`Runway task failed: ${data.failure || "Unknown error"}`);
    }
    console.log(`[BYOK:Runway] Task ${taskId} status: ${data.status} (${data.progress || 0}%)`);
  }
  throw new Error("Runway task timed out after 10 minutes");
}

// ─── OpenAI Sora ───

async function generateWithOpenAI(key: string, req: VideoGenerationRequest): Promise<VideoGenerationResult> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: key, baseURL: "https://api.openai.com/v1" });

  const seconds = String(Math.min(req.duration || 5, 10)) as any;
  const size = req.aspectRatio === "9:16" ? "720x1280" as any : "1280x720" as any;

  const video = await (client as any).videos.create({
    model: "sora-2",
    input: [{ type: "text", text: req.prompt }],
    seconds,
    size,
  });

  console.log(`[BYOK:OpenAI] Video job created: ${video.id}`);

  let result = video;
  const maxWait = 600000;
  const startTime = Date.now();
  while (result.status !== "completed" && Date.now() - startTime < maxWait) {
    await new Promise(r => setTimeout(r, 5000));
    result = await (client as any).videos.retrieve(result.id);
    console.log(`[BYOK:OpenAI] Job ${result.id} status: ${result.status}`);
    if (result.status === "failed") {
      throw new Error(`Sora generation failed: ${result.error?.message || "Unknown"}`);
    }
  }

  if (result.status !== "completed") {
    throw new Error("Sora generation timed out");
  }

  const downloadResp = await (client as any).videos.content(result.id);
  const chunks: Buffer[] = [];
  for await (const chunk of downloadResp.body) {
    chunks.push(Buffer.from(chunk));
  }
  const videoBuffer = Buffer.concat(chunks);

  const { uploadBufferToS3 } = await import("./s3Upload");
  const videoUrl = await uploadBufferToS3(videoBuffer, `sora-${result.id}.mp4`, "video/mp4");

  return { provider: "openai", videoUrl, jobId: result.id, durationSeconds: parseInt(seconds) };
}

// ─── Replicate ───

async function generateWithReplicate(key: string, req: VideoGenerationRequest): Promise<VideoGenerationResult> {
  const model = "wan-ai/wan2.1-t2v-14b";
  
  const input: any = {
    prompt: req.prompt,
    num_frames: Math.min((req.duration || 5) * 8, 81),
    guidance_scale: 5.0,
    num_inference_steps: 30,
  };

  if (req.imageUrl) {
    input.image = req.imageUrl;
  }

  const createResp = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: undefined,
      model,
      input,
    }),
  });

  if (!createResp.ok) {
    const errText = await createResp.text();
    throw new Error(`Replicate API error ${createResp.status}: ${errText}`);
  }

  const prediction = await createResp.json() as any;
  console.log(`[BYOK:Replicate] Prediction created: ${prediction.id}`);

  const maxWait = 600000;
  const startTime = Date.now();
  while (Date.now() - startTime < maxWait) {
    await new Promise(r => setTimeout(r, 5000));

    const pollResp = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { "Authorization": `Bearer ${key}` },
    });
    const data = await pollResp.json() as any;

    if (data.status === "succeeded") {
      const videoUrl = Array.isArray(data.output) ? data.output[0] : data.output;
      if (!videoUrl) throw new Error("Replicate succeeded but no output URL");
      return { provider: "replicate", videoUrl, jobId: prediction.id, durationSeconds: req.duration || 5 };
    }
    if (data.status === "failed" || data.status === "canceled") {
      throw new Error(`Replicate failed: ${data.error || "Unknown"}`);
    }
    console.log(`[BYOK:Replicate] Prediction ${prediction.id} status: ${data.status}`);
  }
  throw new Error("Replicate prediction timed out");
}

// ─── fal.ai ───

async function generateWithFal(key: string, req: VideoGenerationRequest): Promise<VideoGenerationResult> {
  const model = req.imageUrl ? "fal-ai/hunyuan-video/image-to-video" : "fal-ai/hunyuan-video";

  const input: any = {
    prompt: req.prompt,
    num_frames: Math.min((req.duration || 5) * 8, 129),
    num_inference_steps: 30,
    aspect_ratio: req.aspectRatio === "9:16" ? "9:16" : "16:9",
    resolution: req.resolution === "1080p" ? "1080p" : "720p",
    enable_safety_checker: false,
  };

  if (req.imageUrl) {
    input.image_url = req.imageUrl;
  }

  const submitResp = await fetch(`https://queue.fal.run/${model}`, {
    method: "POST",
    headers: {
      "Authorization": `Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!submitResp.ok) {
    const errText = await submitResp.text();
    throw new Error(`fal.ai API error ${submitResp.status}: ${errText}`);
  }

  const submitData = await submitResp.json() as any;
  const requestId = submitData.request_id;
  console.log(`[BYOK:fal.ai] Job submitted: ${requestId}`);

  const maxWait = 600000;
  const startTime = Date.now();
  while (Date.now() - startTime < maxWait) {
    await new Promise(r => setTimeout(r, 5000));

    const statusResp = await fetch(`https://queue.fal.run/${model}/requests/${requestId}/status`, {
      headers: { "Authorization": `Key ${key}` },
    });
    const statusData = await statusResp.json() as any;

    if (statusData.status === "COMPLETED") {
      const resultResp = await fetch(`https://queue.fal.run/${model}/requests/${requestId}`, {
        headers: { "Authorization": `Key ${key}` },
      });
      const resultData = await resultResp.json() as any;
      const videoUrl = resultData.video?.url || resultData.output?.url;
      if (!videoUrl) throw new Error("fal.ai completed but no video URL found");
      return { provider: "fal", videoUrl, jobId: requestId, durationSeconds: req.duration || 5 };
    }
    if (statusData.status === "FAILED") {
      throw new Error(`fal.ai failed: ${statusData.error || "Unknown"}`);
    }
    console.log(`[BYOK:fal.ai] Job ${requestId} status: ${statusData.status}`);
  }
  throw new Error("fal.ai job timed out");
}

// ─── Luma AI ───

async function generateWithLuma(key: string, req: VideoGenerationRequest): Promise<VideoGenerationResult> {
  const body: any = {
    prompt: req.prompt,
    aspect_ratio: req.aspectRatio === "9:16" ? "9:16" : "16:9",
    loop: false,
  };

  if (req.imageUrl) {
    body.keyframes = {
      frame0: { type: "image", url: req.imageUrl },
    };
  }

  const createResp = await fetch("https://api.lumalabs.ai/dream-machine/v1/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!createResp.ok) {
    const errText = await createResp.text();
    throw new Error(`Luma AI error ${createResp.status}: ${errText}`);
  }

  const generation = await createResp.json() as any;
  console.log(`[BYOK:Luma] Generation created: ${generation.id}`);

  const maxWait = 600000;
  const startTime = Date.now();
  while (Date.now() - startTime < maxWait) {
    await new Promise(r => setTimeout(r, 5000));

    const pollResp = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generation.id}`, {
      headers: { "Authorization": `Bearer ${key}` },
    });
    const data = await pollResp.json() as any;

    if (data.state === "completed") {
      const videoUrl = data.assets?.video;
      if (!videoUrl) throw new Error("Luma completed but no video URL");
      return { provider: "luma", videoUrl, jobId: generation.id, durationSeconds: 5 };
    }
    if (data.state === "failed") {
      throw new Error(`Luma failed: ${data.failure_reason || "Unknown"}`);
    }
    console.log(`[BYOK:Luma] Generation ${generation.id} state: ${data.state}`);
  }
  throw new Error("Luma generation timed out");
}

// ─── Hugging Face (Free Tier) ───

async function generateWithHuggingFace(token: string, req: VideoGenerationRequest): Promise<VideoGenerationResult> {
  const model = "Lightricks/LTX-Video-0.9.8-13B-distilled";

  const headers: any = {
    "Content-Type": "application/json",
  };
  if (token && token !== "free") {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const payload: any = {
    inputs: req.prompt,
    parameters: {
      num_frames: Math.min((req.duration || 5) * 8, 65),
      num_inference_steps: 25,
    },
  };

  const resp = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (resp.status === 503) {
    console.log("[BYOK:HuggingFace] Model is loading, waiting 30s...");
    await new Promise(r => setTimeout(r, 30000));
    return generateWithHuggingFace(token, req);
  }

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`HuggingFace API error ${resp.status}: ${errText}`);
  }

  const contentType = resp.headers.get("content-type") || "";
  if (contentType.includes("video") || contentType.includes("octet-stream")) {
    const videoBuffer = Buffer.from(await resp.arrayBuffer());
    const { uploadBufferToS3 } = await import("./s3Upload");
    const videoUrl = await uploadBufferToS3(videoBuffer, `hf-${Date.now()}.mp4`, "video/mp4");
    return { provider: "huggingface", videoUrl, durationSeconds: req.duration || 5 };
  }

  throw new Error("HuggingFace did not return video data");
}

// ─── Pollinations.ai (FREE — No User Key Needed) ───

async function generateWithPollinations(apiKey: string, req: VideoGenerationRequest): Promise<VideoGenerationResult> {
  // Pollinations supports multiple free video models
  // Priority: seedance (best free), grok-video (alpha/free), wan (paid), ltx-2 (paid)
  const freeModels = ["seedance", "grok-video"];
  
  const duration = Math.min(req.duration || 4, 8); // Pollinations max ~8s
  const encodedPrompt = encodeURIComponent(req.prompt);
  
  // Build query params
  const params = new URLSearchParams();
  params.set("duration", String(duration));
  if (req.aspectRatio === "9:16") {
    params.set("width", "480");
    params.set("height", "848");
  } else if (req.aspectRatio === "1:1") {
    params.set("width", "480");
    params.set("height", "480");
  } else {
    params.set("width", "848");
    params.set("height", "480");
  }

  // Try each free model until one works
  for (const model of freeModels) {
    try {
      console.log(`[BYOK:Pollinations] Trying model: ${model}`);
      params.set("model", model);
      
      const url = `https://gen.pollinations.ai/video/${encodedPrompt}?${params.toString()}`;
      
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }
      
      const resp = await fetch(url, {
        method: "GET",
        headers,
        // Pollinations can take a while for video generation
        signal: AbortSignal.timeout(300000), // 5 minute timeout
      });

      if (!resp.ok) {
        const errText = await resp.text().catch(() => "Unknown error");
        console.log(`[BYOK:Pollinations] Model ${model} failed (${resp.status}): ${errText}`);
        continue; // Try next model
      }

      const contentType = resp.headers.get("content-type") || "";
      
      // Check if we got a redirect URL or direct video
      if (contentType.includes("video") || contentType.includes("octet-stream")) {
        // Direct video binary response
        const videoBuffer = Buffer.from(await resp.arrayBuffer());
        if (videoBuffer.length < 1000) {
          console.log(`[BYOK:Pollinations] Model ${model} returned too-small response, skipping`);
          continue;
        }
        const { uploadBufferToS3 } = await import("./s3Upload");
        const videoUrl = await uploadBufferToS3(videoBuffer, `pollinations-${model}-${Date.now()}.mp4`, "video/mp4");
        console.log(`[BYOK:Pollinations] Video generated successfully with ${model}`);
        return { provider: "pollinations", videoUrl, durationSeconds: duration };
      }
      
      // Some models return a JSON with a URL
      if (contentType.includes("json")) {
        const data = await resp.json() as any;
        if (data.url || data.video_url || data.output) {
          const videoUrl = data.url || data.video_url || data.output;
          console.log(`[BYOK:Pollinations] Video URL received from ${model}: ${videoUrl}`);
          return { provider: "pollinations", videoUrl, durationSeconds: duration };
        }
      }

      // If the response URL itself is the video (redirect)
      if (resp.url && resp.url !== url) {
        console.log(`[BYOK:Pollinations] Redirected to video URL: ${resp.url}`);
        return { provider: "pollinations", videoUrl: resp.url, durationSeconds: duration };
      }

      console.log(`[BYOK:Pollinations] Model ${model} returned unexpected content-type: ${contentType}`);
    } catch (err: any) {
      if (err.name === "TimeoutError" || err.name === "AbortError") {
        console.log(`[BYOK:Pollinations] Model ${model} timed out`);
      } else {
        console.log(`[BYOK:Pollinations] Model ${model} error: ${err.message}`);
      }
    }
  }

  throw new Error("Pollinations: All free video models failed. The service may be temporarily unavailable.");
}

// ─── Main Entry Point ───

export async function generateVideo(
  keys: UserApiKeys,
  req: VideoGenerationRequest
): Promise<VideoGenerationResult> {
  const provider = selectProvider(keys);

  console.log(`[BYOK] Using provider: ${provider}`);

  // Build the key map, merging user keys with platform-level keys
  const keyMap: Record<VideoProvider, string | null | undefined> = {
    runway: keys.runwayKey || ENV.runwayApiKey || null,
    openai: keys.openaiKey || ENV.openaiApiKey || null,
    replicate: keys.replicateKey || null,
    fal: keys.falKey || null,
    luma: keys.lumaKey || null,
    huggingface: keys.hfToken || "free",
    pollinations: ENV.pollinationsApiKey || "",
  };

  const providerFunctions: Record<VideoProvider, (key: string, req: VideoGenerationRequest) => Promise<VideoGenerationResult>> = {
    runway: generateWithRunway,
    openai: generateWithOpenAI,
    replicate: generateWithReplicate,
    fal: generateWithFal,
    luma: generateWithLuma,
    huggingface: generateWithHuggingFace,
    pollinations: generateWithPollinations,
  };

  const key = keyMap[provider];
  if (!key && provider !== "pollinations") {
    // If no key for selected provider, fall back to Pollinations
    console.log(`[BYOK] No key for ${provider}, falling back to Pollinations (free)`);
    try {
      return await generateWithPollinations(ENV.pollinationsApiKey || "", req);
    } catch (err: any) {
      throw new Error(`Video generation failed. No API key for ${provider} and Pollinations fallback failed: ${err.message}`);
    }
  }

  try {
    return await providerFunctions[provider](key || "", req);
  } catch (err: any) {
    console.error(`[BYOK:${provider}] Failed:`, err.message);

    // Try fallback providers (user keys first, then platform keys, then Pollinations)
    const available = getAvailableProviders(keys).filter(p => p !== provider);
    for (const fallback of available) {
      const fallbackKey = keyMap[fallback];
      if (!fallbackKey && fallback !== "pollinations") continue;
      console.log(`[BYOK] Falling back to ${fallback}...`);
      try {
        return await providerFunctions[fallback](fallbackKey || "", req);
      } catch (fbErr: any) {
        console.error(`[BYOK:${fallback}] Fallback also failed:`, fbErr.message);
      }
    }

    throw new Error(`Video generation failed with all providers. Last error: ${err.message}`);
  }
}

// ─── Provider Info (for frontend display) ───

export interface ProviderInfo {
  id: VideoProvider;
  name: string;
  description: string;
  keyPrefix: string;
  signupUrl: string;
  pricing: string;
  models: string;
}

export const VIDEO_PROVIDERS: ProviderInfo[] = [
  {
    id: "pollinations",
    name: "Pollinations.ai (Free)",
    description: "Free AI video generation. No API key needed. Lower quality but zero cost — perfect for previews and free-tier users.",
    keyPrefix: "sk_",
    signupUrl: "https://pollinations.ai",
    pricing: "FREE — 1.5 pollen/week on Spore tier. No credit card required.",
    models: "Seedance, Grok-Video (free models)",
  },
  {
    id: "runway",
    name: "Runway ML",
    description: "Industry-leading AI video generation. Best quality and consistency.",
    keyPrefix: "key_",
    signupUrl: "https://app.runwayml.com/settings/api-keys",
    pricing: "From $12/mo (Standard). ~$0.05-0.10 per second of video.",
    models: "Gen-4 Turbo, Gen-3 Alpha",
  },
  {
    id: "fal",
    name: "fal.ai",
    description: "Fast and affordable. Supports HunyuanVideo, Veo3, LTX-Video.",
    keyPrefix: "",
    signupUrl: "https://fal.ai/dashboard/keys",
    pricing: "Pay-per-use. ~$0.40 per video clip.",
    models: "HunyuanVideo, Google Veo 3, LTX-Video",
  },
  {
    id: "replicate",
    name: "Replicate",
    description: "Run open-source video models in the cloud. Great for Wan2.1.",
    keyPrefix: "r8_",
    signupUrl: "https://replicate.com/account/api-tokens",
    pricing: "Pay-per-use. Free tier available for some models.",
    models: "Wan2.1, CogVideoX, Stable Video Diffusion",
  },
  {
    id: "openai",
    name: "OpenAI (Sora)",
    description: "OpenAI's Sora video model. Requires Plus/Pro subscription.",
    keyPrefix: "sk-",
    signupUrl: "https://platform.openai.com/api-keys",
    pricing: "Requires OpenAI Plus ($20/mo) or Pro ($200/mo) for Sora access.",
    models: "Sora 2, Sora 2 Pro",
  },
  {
    id: "luma",
    name: "Luma AI",
    description: "Dream Machine video generation. Great for cinematic content.",
    keyPrefix: "",
    signupUrl: "https://lumalabs.ai/dream-machine/api",
    pricing: "Pay-per-use. Free trial credits available.",
    models: "Dream Machine 1.5, Dream Machine 2",
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    description: "Free inference API with open-source models. Limited but free.",
    keyPrefix: "hf_",
    signupUrl: "https://huggingface.co/settings/tokens",
    pricing: "FREE tier: 300 requests/hour. Pro: $9/mo for more.",
    models: "LTX-Video, Wan2.1, HunyuanVideo (via providers)",
  },
];

export function getProviderInfo(id: VideoProvider): ProviderInfo | undefined {
  return VIDEO_PROVIDERS.find(p => p.id === id);
}

export function validateApiKey(provider: VideoProvider, key: string): { valid: boolean; message: string } {
  if (provider === "pollinations") {
    return { valid: true, message: "Pollinations is free — no key validation needed" };
  }
  
  if (!key || key.trim().length === 0) {
    return { valid: false, message: "API key cannot be empty" };
  }

  const info = getProviderInfo(provider);
  if (!info) return { valid: false, message: "Unknown provider" };

  switch (provider) {
    case "runway":
      if (!key.startsWith("key_")) return { valid: false, message: "Runway keys must start with 'key_'" };
      break;
    case "openai":
      if (!key.startsWith("sk-")) return { valid: false, message: "OpenAI keys must start with 'sk-'" };
      break;
    case "replicate":
      if (!key.startsWith("r8_")) return { valid: false, message: "Replicate keys must start with 'r8_'" };
      break;
    case "huggingface":
      if (!key.startsWith("hf_")) return { valid: false, message: "Hugging Face tokens must start with 'hf_'" };
      break;
  }

  return { valid: true, message: "Key format looks valid" };
}
