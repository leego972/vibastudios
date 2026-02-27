/**
 * Cinematic Prompt Engine
 * 
 * Generates rich, cinematographer-level image prompts with:
 * - Visual DNA (consistent style across all scenes)
 * - Genre-specific cinematography intelligence
 * - Character reference injection
 * - Color theory and composition direction
 * - Lens simulation and depth staging
 */

// ─── Genre Visual Profiles ───
// Each genre has a distinct visual language used in real Hollywood productions

export type GenreProfile = {
  colorPalette: string;
  lightingStyle: string;
  lensPreference: string;
  compositionNotes: string;
  textureNotes: string;
  moodKeywords: string;
};

const GENRE_PROFILES: Record<string, GenreProfile> = {
  "Action": {
    colorPalette: "high-contrast teal and orange color grade, punchy saturated colors, deep blacks",
    lightingStyle: "hard directional lighting with strong shadows, rim lighting on characters, practical light sources",
    lensPreference: "24mm wide-angle for establishing shots, 85mm telephoto for close-ups with background compression, handheld camera movement",
    compositionNotes: "dynamic diagonal compositions, dutch angles during intense moments, leading lines toward action",
    textureNotes: "subtle film grain, slight motion blur on fast movements, sharp focus on hero subjects",
    moodKeywords: "intense, kinetic, explosive, visceral, adrenaline",
  },
  "Drama": {
    colorPalette: "muted earth tones with selective warm highlights, desaturated backgrounds, skin tones preserved",
    lightingStyle: "naturalistic soft lighting, window light with gentle shadows, motivated practical lighting",
    lensPreference: "50mm standard lens for naturalism, 85mm for intimate close-ups with creamy bokeh f/1.4, steady tripod shots",
    compositionNotes: "rule of thirds with subject in negative space, symmetrical frames for power dynamics, shallow depth of field isolating subjects",
    textureNotes: "fine film grain, natural skin texture, soft vignette drawing eye to center",
    moodKeywords: "intimate, contemplative, raw, emotional, grounded",
  },
  "Comedy": {
    colorPalette: "bright warm palette, slightly elevated saturation, cheerful color temperature around 5600K",
    lightingStyle: "flat even lighting, minimal harsh shadows, bright and inviting, high key lighting",
    lensPreference: "35mm lens for environmental comedy, 50mm for dialogue scenes, wider angles for physical comedy, steady smooth camera",
    compositionNotes: "centered framing for comedic timing, wide shots showing full body for physical comedy, clean uncluttered backgrounds",
    textureNotes: "clean digital look, minimal grain, sharp throughout, bright and polished",
    moodKeywords: "lighthearted, vibrant, playful, warm, inviting",
  },
  "Horror": {
    colorPalette: "desaturated cold blue-green tones, sickly yellows in practicals, deep crushed blacks, selective red accents",
    lightingStyle: "extreme low-key lighting, single harsh source creating deep shadows, underlighting for menace, flickering practicals",
    lensPreference: "wide-angle 18-24mm for distortion and unease, extreme close-ups on 100mm macro, slow deliberate camera movements, occasional sudden snap zooms",
    compositionNotes: "negative space creating dread, subjects off-center with empty threatening space, foreground obstruction creating voyeuristic feel, deep staging with threats in background",
    textureNotes: "heavy film grain, slightly soft focus creating dreamlike unease, chromatic aberration at edges, dark vignette",
    moodKeywords: "dread, claustrophobic, unsettling, ominous, visceral terror",
  },
  "Sci-Fi": {
    colorPalette: "cool blue-steel palette with neon accent colors, cyan and magenta highlights, metallic silver tones",
    lightingStyle: "practical neon and LED lighting, holographic rim lights, volumetric fog with colored light beams, stark clinical whites",
    lensPreference: "anamorphic lens with horizontal flares, 35mm for environments showing scale, 50mm for character work, smooth dolly and crane movements",
    compositionNotes: "symmetrical compositions suggesting order or control, vast scale with small human figures, geometric framing through architecture, deep focus showing layered environments",
    textureNotes: "ultra-clean digital look for advanced civilizations, gritty grain for dystopian, lens flares from practical lights, sharp detail on technology",
    moodKeywords: "awe-inspiring, vast, technological, otherworldly, cerebral",
  },
  "Romance": {
    colorPalette: "warm golden tones, soft pastels, rosy skin tones, gentle amber highlights, dreamy color wash",
    lightingStyle: "golden hour backlight with lens flare, soft diffused window light, candlelight warmth, Rembrandt lighting on faces",
    lensPreference: "85mm f/1.2 for dreamy shallow depth of field, 135mm for compressed intimate two-shots, gentle slow camera movements",
    compositionNotes: "two-shots with balanced framing, over-shoulder shots creating intimacy, close-ups on eyes and hands, soft foreground elements framing subjects",
    textureNotes: "soft diffusion filter, gentle halation around highlights, creamy smooth bokeh, minimal grain",
    moodKeywords: "tender, warm, intimate, yearning, passionate",
  },
  "Thriller": {
    colorPalette: "cold desaturated palette with sickly green undertones, high contrast, selective warm accents on faces",
    lightingStyle: "motivated harsh lighting creating paranoid shadows, venetian blind patterns, single overhead source, pools of light in darkness",
    lensPreference: "50mm standard creating normalcy that feels wrong, occasional wide-angle distortion for paranoia, slow push-ins building tension, handheld for anxiety",
    compositionNotes: "tight framing creating claustrophobia, subjects trapped by frame edges, reflections and mirrors showing dual nature, deep focus where threats lurk in background",
    textureNotes: "moderate grain adding grit, slightly desaturated, sharp focus on details and clues, dark vignette",
    moodKeywords: "paranoid, tense, suffocating, suspenseful, edge-of-seat",
  },
  "Fantasy": {
    colorPalette: "rich saturated jewel tones, deep emeralds and golds, warm amber firelight, magical purple and blue accents",
    lightingStyle: "ethereal rim lighting, god rays through canopy, firelight and torchlight, magical glow emanating from objects and characters",
    lensPreference: "wide-angle 24mm for epic landscapes and architecture, 50mm for character work, crane shots for scale, slow majestic camera movements",
    compositionNotes: "epic wide establishing shots with tiny figures in vast landscapes, ornate framing through arches and doorways, vertical compositions for towers and mountains, layered depth with atmospheric perspective",
    textureNotes: "painterly quality with photorealistic detail, slight soft glow on magical elements, rich texture on fabrics and armor, atmospheric haze",
    moodKeywords: "epic, magical, wondrous, mythic, enchanting",
  },
  "Western": {
    colorPalette: "dusty warm amber and burnt sienna, bleached highlights, deep shadow contrast, sun-baked earth tones",
    lightingStyle: "harsh overhead noon sun, long dramatic shadows at golden hour, dusty volumetric light beams, campfire warmth at night",
    lensPreference: "wide-angle for vast landscapes, extreme close-ups on eyes during standoffs, long telephoto compressing heat haze, steady locked-off compositions",
    compositionNotes: "extreme wide shots dwarfing characters in landscape, symmetrical standoff framing, low angle hero shots against sky, horizontal compositions emphasizing vastness",
    textureNotes: "heavy grain simulating 1960s film stock, dust particles in air, weathered textures on everything, heat distortion",
    moodKeywords: "rugged, desolate, stoic, sun-scorched, lawless",
  },
  "Animation": {
    colorPalette: "vibrant saturated colors, bold primary palette, clean color separation, stylized color choices",
    lightingStyle: "stylized dramatic lighting, bold shadows with clean edges, rim lighting for character separation, expressive colored lighting",
    lensPreference: "dynamic virtual camera angles impossible in live action, sweeping crane movements, dramatic perspective shifts, fish-eye for comedy",
    compositionNotes: "exaggerated perspective for drama, clean readable silhouettes, strong foreground-background separation, dynamic action lines",
    textureNotes: "clean rendered surfaces, stylized texture detail, smooth gradients, sharp outlines",
    moodKeywords: "vibrant, expressive, dynamic, stylized, imaginative",
  },
};

const DEFAULT_PROFILE: GenreProfile = GENRE_PROFILES["Drama"];

// ─── Time of Day Lighting ───

const TIME_OF_DAY_LIGHTING: Record<string, string> = {
  "dawn": "pre-sunrise blue hour light transitioning to warm pink and gold on horizon, long soft shadows, misty atmospheric haze, color temperature shifting from 3200K to 5000K",
  "morning": "clean bright morning light at 45-degree angle, crisp shadows, fresh color temperature around 5500K, slight morning mist catching light beams",
  "afternoon": "overhead warm sunlight, shorter defined shadows, bright even illumination, color temperature 5600K, clear atmospheric conditions",
  "evening": "warm golden hour sidelight at low angle, long dramatic shadows, rich amber and orange tones, color temperature 3500K, atmospheric dust catching light",
  "night": "cool blue moonlight key with warm practical fill from streetlights/windows, deep shadows, color temperature contrast between 3200K warm practicals and 7000K cool ambient, visible light sources",
  "golden-hour": "magic hour backlight with intense warm glow, lens flare from low sun, silhouette potential, rich orange and gold tones, color temperature 3000K, long horizontal shadows, atmospheric particles glowing",
};

// ─── Weather Atmosphere ───

const WEATHER_ATMOSPHERE: Record<string, string> = {
  "clear": "crystal clear atmosphere, sharp distant details, clean sky, high visibility",
  "cloudy": "overcast diffused lighting eliminating harsh shadows, flat even illumination, grey sky providing natural softbox effect, muted colors",
  "rainy": "wet reflective surfaces doubling light sources, rain streaks catching light, glistening textures, reduced visibility, moody atmosphere, puddle reflections",
  "stormy": "dramatic dark clouds with breaks of intense light, wind-blown elements, high contrast between dark sky and lit subjects, turbulent atmosphere, lightning potential",
  "snowy": "bright diffused light bouncing off white ground, cool blue shadows on snow, reduced contrast, soft falling snowflakes, muffled quiet atmosphere",
  "foggy": "heavy atmospheric diffusion, limited visibility creating depth layers, halos around light sources, mysterious obscured backgrounds, soft edges on everything",
  "windy": "dynamic movement in hair/clothing/vegetation, dust or particles in air catching light, sense of force and energy, slightly desaturated from airborne particles",
};

// ─── Camera Angle Technical Details ───

const CAMERA_ANGLE_DETAILS: Record<string, string> = {
  "wide": "wide establishing shot on 24mm lens showing full environment and spatial relationships, deep focus f/8, characters placed in context of their surroundings",
  "medium": "medium shot on 50mm lens from waist up, natural perspective matching human eye, f/2.8 with gentle background separation, conversational distance",
  "close-up": "close-up on 85mm lens capturing face and shoulders, shallow depth of field f/1.8 with creamy bokeh background, intimate emotional connection, every facial detail visible",
  "extreme-close-up": "extreme close-up on 100mm macro lens isolating specific detail — eyes, hands, object — razor-thin depth of field f/1.4, abstract and intense",
  "birds-eye": "overhead birds-eye view looking straight down, showing spatial patterns and geography, god-like perspective, subjects appear small and vulnerable",
  "low-angle": "low-angle shot looking up at subject, 35mm lens, subject appears powerful and dominant, sky or ceiling visible behind, heroic or threatening depending on context",
  "dutch-angle": "dutch angle tilted 15-30 degrees creating visual unease and disorientation, 35mm lens, psychological tension, world feels off-balance",
  "over-shoulder": "over-the-shoulder shot on 50mm, foreground shoulder/head out of focus framing the subject, creates conversational dynamic and spatial relationship between characters",
  "pov": "point-of-view shot simulating character's vision, slight handheld movement, 35mm lens matching human field of view, immersive first-person perspective",
};

// ─── Visual DNA Builder ───

export type VisualDNA = {
  genreProfile: GenreProfile;
  filmTitle: string;
  genre: string;
  tone: string;
  colorGrading: string;
  consistencyTokens: string;
  characterDescriptions: string[];
};

export function buildVisualDNA(project: {
  title: string;
  genre?: string | null;
  tone?: string | null;
  colorGrading?: string | null;
  colorGradingSettings?: any;
  rating?: string | null;
  themes?: string | null;
  setting?: string | null;
}, characters: Array<{
  name: string;
  description?: string | null;
  photoUrl?: string | null;
  attributes?: any;
}>): VisualDNA {
  const genre = project.genre || "Drama";
  const profile = GENRE_PROFILES[genre] || DEFAULT_PROFILE;
  
  // Build character visual descriptions for consistency
  const charDescs = characters.map(c => {
    const attrs = c.attributes || {};
    const parts = [`${c.name}:`];
    if (attrs.gender) parts.push(attrs.gender);
    if (attrs.ageRange || attrs.estimatedAge) parts.push(`${attrs.ageRange || attrs.estimatedAge}`);
    if (attrs.ethnicity) parts.push(attrs.ethnicity);
    if (attrs.build) parts.push(`${attrs.build} build`);
    if (attrs.hairColor && attrs.hairStyle) parts.push(`${attrs.hairColor} ${attrs.hairStyle} hair`);
    if (attrs.eyeColor) parts.push(`${attrs.eyeColor} eyes`);
    if (attrs.clothingStyle) parts.push(`wearing ${attrs.clothingStyle}`);
    if (attrs.facialFeatures) parts.push(attrs.facialFeatures);
    if (attrs.distinguishingMarks) parts.push(attrs.distinguishingMarks);
    return parts.join(" ");
  });

  // Build consistency tokens — these go in EVERY prompt to maintain visual coherence
  const consistencyParts = [
    `Film: "${project.title}"`,
    `Genre: ${genre}`,
    `Visual style: ${profile.colorPalette}`,
    `Lighting approach: ${profile.lightingStyle}`,
    `Lens: ${profile.lensPreference}`,
    `Texture: ${profile.textureNotes}`,
  ];
  if (project.tone) consistencyParts.push(`Tone: ${project.tone}`);
  if (project.colorGrading && project.colorGrading !== "natural") {
    consistencyParts.push(`Color grade: ${project.colorGrading}`);
  }
  if (project.setting) consistencyParts.push(`Setting: ${project.setting}`);

  return {
    genreProfile: profile,
    filmTitle: project.title,
    genre,
    tone: project.tone || profile.moodKeywords.split(",")[0].trim(),
    colorGrading: project.colorGrading || "natural",
    consistencyTokens: consistencyParts.join(". "),
    characterDescriptions: charDescs,
  };
}

// ─── Cinematic Scene Prompt Builder ───

export function buildScenePrompt(
  scene: {
    title?: string | null;
    description?: string | null;
    timeOfDay?: string | null;
    weather?: string | null;
    lighting?: string | null;
    cameraAngle?: string | null;
    locationType?: string | null;
    mood?: string | null;
    realEstateStyle?: string | null;
    vehicleType?: string | null;
    colorGrading?: string | null;
    productionNotes?: string | null;
  },
  visualDNA: VisualDNA,
  options?: {
    sceneIndex?: number;
    totalScenes?: number;
    previousSceneDescription?: string;
    characterNames?: string[];
  }
): string {
  const parts: string[] = [];

  // 1. Core visual identity (consistency anchor)
  parts.push(`[VISUAL STYLE: ${visualDNA.consistencyTokens}]`);

  // 2. Shot type and camera
  const cameraAngle = scene.cameraAngle || "medium";
  const cameraDetail = CAMERA_ANGLE_DETAILS[cameraAngle] || CAMERA_ANGLE_DETAILS["medium"];
  parts.push(`Cinematic film still — ${cameraDetail}`);

  // 3. Scene description (the core content)
  if (scene.description) {
    parts.push(scene.description);
  }

  // 4. Characters in scene
  if (options?.characterNames && options.characterNames.length > 0) {
    const charRefs = options.characterNames
      .map(name => {
        const charDesc = visualDNA.characterDescriptions.find(d => d.startsWith(`${name}:`));
        return charDesc || name;
      })
      .join("; ");
    parts.push(`Characters present: ${charRefs}`);
  }

  // 5. Location and setting
  if (scene.locationType) {
    parts.push(`Location: ${scene.locationType}`);
  }
  if (scene.realEstateStyle) {
    parts.push(`Setting architecture: ${scene.realEstateStyle}`);
  }
  if (scene.vehicleType && scene.vehicleType !== "None") {
    parts.push(`Vehicle: ${scene.vehicleType}`);
  }

  // 6. Time of day with technical lighting
  const timeOfDay = scene.timeOfDay || "afternoon";
  const timeLight = TIME_OF_DAY_LIGHTING[timeOfDay] || TIME_OF_DAY_LIGHTING["afternoon"];
  parts.push(`Time: ${timeLight}`);

  // 7. Weather atmosphere
  const weather = scene.weather || "clear";
  const weatherAtmo = WEATHER_ATMOSPHERE[weather] || WEATHER_ATMOSPHERE["clear"];
  parts.push(`Atmosphere: ${weatherAtmo}`);

  // 8. Lighting setup (scene-specific override + genre default)
  const lighting = scene.lighting || "natural";
  parts.push(`Lighting: ${lighting} setup — ${visualDNA.genreProfile.lightingStyle}`);

  // 9. Mood and emotional direction
  if (scene.mood) {
    parts.push(`Mood: ${scene.mood}, ${visualDNA.genreProfile.moodKeywords}`);
  }

  // 10. Genre-specific composition
  parts.push(`Composition: ${visualDNA.genreProfile.compositionNotes}`);

  // 11. Color and texture
  parts.push(`Color: ${visualDNA.genreProfile.colorPalette}`);
  parts.push(`Texture: ${visualDNA.genreProfile.textureNotes}`);

  // 12. Scene-specific color grading override
  if (scene.colorGrading && scene.colorGrading !== "natural") {
    parts.push(`Scene color grade override: ${scene.colorGrading}`);
  }

  // 13. Production notes (director's vision)
  if (scene.productionNotes) {
    parts.push(`Director's notes: ${scene.productionNotes}`);
  }

  // 14. Narrative position context
  if (options?.sceneIndex !== undefined && options?.totalScenes) {
    const position = options.sceneIndex / options.totalScenes;
    if (position < 0.15) {
      parts.push("Opening act — establishing tone, introduce world and characters, sense of beginning");
    } else if (position < 0.35) {
      parts.push("Rising action — building tension, deepening character relationships, stakes increasing");
    } else if (position > 0.45 && position < 0.6) {
      parts.push("Midpoint — major turning point, shift in dynamics, heightened visual intensity");
    } else if (position > 0.75 && position < 0.9) {
      parts.push("Climax — peak emotional and visual intensity, most dramatic lighting and composition");
    } else if (position >= 0.9) {
      parts.push("Resolution — emotional denouement, softer lighting, sense of closure or transformation");
    }
  }

  // 15. Technical quality anchors
  parts.push("Ultra-photorealistic, indistinguishable from a real film frame, shot on ARRI ALEXA 65 with Zeiss Master Prime lens, 8K resolution, professional Hollywood production value, natural skin subsurface scattering on any visible people");

  return parts.join(". ");
}

// ─── Enhanced LLM System Prompt for Scene Breakdown ───

export function buildSceneBreakdownSystemPrompt(project: {
  title: string;
  genre?: string | null;
  rating?: string | null;
  duration?: number | null;
  tone?: string | null;
  actStructure?: string | null;
  themes?: string | null;
  setting?: string | null;
}): string {
  const genre = project.genre || "Drama";
  const profile = GENRE_PROFILES[genre] || DEFAULT_PROFILE;
  const duration = project.duration || 90;
  const actStructure = project.actStructure || "three-act";

  return `You are an elite Hollywood film director and cinematographer with 30 years of experience directing ${genre} films. You are planning the visual storytelling for "${project.title}", a ${duration}-minute ${project.rating || "PG-13"} rated ${genre} film.

Your visual signature for this film:
- Color palette: ${profile.colorPalette}
- Lighting approach: ${profile.lightingStyle}
- Lens choices: ${profile.lensPreference}
- Composition style: ${profile.compositionNotes}
- Texture and grain: ${profile.textureNotes}
- Emotional keywords: ${profile.moodKeywords}
${project.tone ? `- Director's tone: ${project.tone}` : ""}
${project.themes ? `- Thematic elements: ${project.themes}` : ""}
${project.setting ? `- World/setting: ${project.setting}` : ""}

Structure this as a ${actStructure} narrative. Each scene must be a SPECIFIC, VIVID moment — not a summary. Describe exactly what the camera sees: the environment details, character actions, facial expressions, body language, spatial relationships, and atmospheric elements.

For each scene, think like a cinematographer:
- What lens would you choose and why?
- Where is the light coming from?
- What's in the foreground, midground, and background?
- What colors dominate this frame?
- What emotion should the audience feel?
- How does this scene's visual language connect to the scenes before and after it?

Return JSON with an array of scenes.`;
}

// ─── Enhanced Scene Schema with Cinematic Fields ───

export const ENHANCED_SCENE_SCHEMA = {
  type: "object" as const,
  properties: {
    scenes: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          title: { type: "string" as const },
          description: { type: "string" as const },
          visualDescription: { type: "string" as const },
          timeOfDay: { type: "string" as const },
          weather: { type: "string" as const },
          lighting: { type: "string" as const },
          cameraAngle: { type: "string" as const },
          locationType: { type: "string" as const },
          mood: { type: "string" as const },
          estimatedDuration: { type: "number" as const },
          colorPalette: { type: "string" as const },
          focalLength: { type: "string" as const },
          depthOfField: { type: "string" as const },
          foregroundElements: { type: "string" as const },
          backgroundElements: { type: "string" as const },
          characterAction: { type: "string" as const },
          emotionalBeat: { type: "string" as const },
          transitionFromPrevious: { type: "string" as const },
        },
        required: [
          "title", "description", "visualDescription", "timeOfDay", "weather",
          "lighting", "cameraAngle", "locationType", "mood", "estimatedDuration",
          "colorPalette", "focalLength", "depthOfField", "foregroundElements",
          "backgroundElements", "characterAction", "emotionalBeat", "transitionFromPrevious"
        ] as const,
        additionalProperties: false as const,
      },
    },
  },
  required: ["scenes"] as const,
  additionalProperties: false as const,
};

// ─── Trailer Prompt Builder ───

export function buildTrailerPrompt(
  scene: {
    description?: string | null;
    lighting?: string | null;
    mood?: string | null;
  },
  visualDNA: VisualDNA,
  trailerDescription: string
): string {
  const parts = [
    `[VISUAL STYLE: ${visualDNA.consistencyTokens}]`,
    `Cinematic Hollywood trailer shot, G-rated family-friendly imagery`,
    trailerDescription,
    `${scene.lighting || "dramatic"} lighting — ${visualDNA.genreProfile.lightingStyle}`,
    `${scene.mood || "epic"} mood`,
    `Color: ${visualDNA.genreProfile.colorPalette}`,
    `Composition: ${visualDNA.genreProfile.compositionNotes}`,
    `widescreen 2.39:1 aspect ratio, photorealistic, 8K, cinematic color grading`,
    `no violence, no gore, no mature content, suitable for all audiences`,
    `${visualDNA.genreProfile.textureNotes}`,
  ];
  return parts.join(", ");
}
