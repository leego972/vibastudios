import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import { SubscriptionGate } from "./components/SubscriptionGate";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import NewProject from "./pages/NewProject";
import Characters from "./pages/Characters";
import SceneEditor from "./pages/SceneEditor";
import ScriptWriter from "./pages/ScriptWriter";
import Storyboard from "./pages/Storyboard";
import CreditsEditor from "./pages/CreditsEditor";
import ShotList from "./pages/ShotList";
import ContinuityCheck from "./pages/ContinuityCheck";
import ColorGrading from "./pages/ColorGrading";
import LocationScout from "./pages/LocationScout";
import MoodBoard from "./pages/MoodBoard";
import Subtitles from "./pages/Subtitles";
import DialogueEditor from "./pages/DialogueEditor";
import BudgetEstimator from "./pages/BudgetEstimator";
import SoundEffects from "./pages/SoundEffects";
import VisualEffects from "./pages/VisualEffects";
import Collaboration from "./pages/Collaboration";
import Movies from "./pages/Movies";
import AdPosterMaker from "./pages/AdPosterMaker";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminUsers from "./pages/AdminUsers";
import Pricing from "./pages/Pricing";
import CampaignManager from "./pages/CampaignManager";

// Gated page wrappers — show upgrade prompt if user's subscription doesn't include the feature
function GatedScriptWriter() { return <SubscriptionGate feature="Script Writer" featureKey="canUseScriptWriter" requiredTier="pro"><ScriptWriter /></SubscriptionGate>; }
function GatedStoryboard() { return <SubscriptionGate feature="Storyboard" featureKey="canUseStoryboard" requiredTier="pro"><Storyboard /></SubscriptionGate>; }
function GatedCreditsEditor() { return <SubscriptionGate feature="Credits Editor" featureKey="canUseScriptWriter" requiredTier="pro"><CreditsEditor /></SubscriptionGate>; }
function GatedShotList() { return <SubscriptionGate feature="Shot List" featureKey="canUseShotList" requiredTier="pro"><ShotList /></SubscriptionGate>; }
function GatedContinuityCheck() { return <SubscriptionGate feature="Continuity Check" featureKey="canUseContinuityCheck" requiredTier="pro"><ContinuityCheck /></SubscriptionGate>; }
function GatedColorGrading() { return <SubscriptionGate feature="Color Grading" featureKey="canUseColorGrading" requiredTier="pro"><ColorGrading /></SubscriptionGate>; }
function GatedLocationScout() { return <SubscriptionGate feature="Location Scout" featureKey="canUseLocationScout" requiredTier="pro"><LocationScout /></SubscriptionGate>; }
function GatedMoodBoard() { return <SubscriptionGate feature="Mood Board" featureKey="canUseMoodBoard" requiredTier="pro"><MoodBoard /></SubscriptionGate>; }
function GatedSubtitles() { return <SubscriptionGate feature="Subtitles" featureKey="canUseSubtitles" requiredTier="pro"><Subtitles /></SubscriptionGate>; }
function GatedDialogueEditor() { return <SubscriptionGate feature="Dialogue Editor" featureKey="canUseDialogueEditor" requiredTier="pro"><DialogueEditor /></SubscriptionGate>; }
function GatedBudgetEstimator() { return <SubscriptionGate feature="Budget Estimator" featureKey="canUseBudgetEstimator" requiredTier="pro"><BudgetEstimator /></SubscriptionGate>; }
function GatedSoundEffects() { return <SubscriptionGate feature="Sound Effects" featureKey="canUseSoundEffects" requiredTier="pro"><SoundEffects /></SubscriptionGate>; }
function GatedVisualEffects() { return <SubscriptionGate feature="Visual Effects" featureKey="canUseVisualEffects" requiredTier="pro"><VisualEffects /></SubscriptionGate>; }
function GatedCollaboration() { return <SubscriptionGate feature="Collaboration" featureKey="canUseCollaboration" requiredTier="pro"><Collaboration /></SubscriptionGate>; }

function Router() {
  return (
    <Switch>
      {/* Auth pages (no layout) */}
      <Route path="/login" component={Login} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* Full-screen pages with subscription gates */}
      <Route path="/projects/:projectId/script/:scriptId" component={GatedScriptWriter} />
      <Route path="/projects/:projectId/storyboard" component={GatedStoryboard} />
      <Route path="/projects/:projectId/credits" component={GatedCreditsEditor} />
      <Route path="/projects/:projectId/shot-list" component={GatedShotList} />
      <Route path="/projects/:projectId/continuity" component={GatedContinuityCheck} />
      <Route path="/projects/:projectId/color-grading" component={GatedColorGrading} />
      <Route path="/projects/:id/locations" component={GatedLocationScout} />
      <Route path="/projects/:id/mood-board" component={GatedMoodBoard} />
      <Route path="/projects/:id/subtitles" component={GatedSubtitles} />
      <Route path="/projects/:projectId/dialogue" component={GatedDialogueEditor} />
      <Route path="/projects/:projectId/budget" component={GatedBudgetEstimator} />
      <Route path="/projects/:id/sound-effects" component={GatedSoundEffects} />
      <Route path="/projects/:id/visual-effects" component={GatedVisualEffects} />
      <Route path="/projects/:id/collaboration" component={GatedCollaboration} />

      {/* Dashboard layout pages */}
      <Route>
        <DashboardLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/projects" component={Projects} />
            <Route path="/projects/new" component={NewProject} />
            <Route path="/projects/:id" component={ProjectDetail} />
            <Route path="/projects/:id/scenes" component={SceneEditor} />
            <Route path="/movies" component={Movies} />
            <Route path="/poster-maker" component={AdPosterMaker} />
            <Route path="/characters" component={Characters} />
            <Route path="/campaigns" component={CampaignManager} />
            <Route path="/admin/users" component={AdminUsers} />
            <Route path="/404" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </DashboardLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
