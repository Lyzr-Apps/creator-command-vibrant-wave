'use client'

import { useState, useEffect } from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  FaInstagram, FaChartLine, FaLightbulb, FaPencilAlt, FaBrain,
  FaCog, FaUser, FaBars, FaTimes, FaChevronDown, FaChevronUp,
  FaPlay, FaCheck, FaExclamationTriangle, FaRocket, FaSave,
  FaArrowRight, FaArrowLeft, FaPlus, FaMinus, FaEye, FaHeart,
  FaBookmark, FaShare, FaComment, FaClock, FaFire, FaTrophy,
  FaChartBar, FaSearchPlus, FaEdit, FaTrash, FaCopy, FaSync,
  FaFileAlt, FaHistory, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa'

// ============================================================================
// TYPE DEFINITIONS FROM ACTUAL AGENT RESPONSES
// ============================================================================

interface HeroInsight {
  statement: string
  confidence: number
  why_it_matters: string
  supporting_data: {
    educational_saves_avg: number
    personal_saves_avg: number
    multiplier: string
  }
  expandable_details: {
    top_example: {
      post_title: string
      saves: number
      why_it_worked: string
    }
    pattern_explanation: string
    what_to_do: string
  }
}

interface SnapshotCard {
  type: 'top_post' | 'pattern_detected' | 'missed_opportunity'
  title: string
  thumbnail_url?: string
  description?: string
  metrics?: {
    likes: number
    saves: number
    engagement_rate: string
  }
  data_point?: string
  potential_impact?: string
  suggestion?: string
  tag: string
  insight?: string
}

interface IdeaCard {
  id: string
  title: string
  hook: string
  concept?: string
  why_it_works: string
  format: string
  effort_level: string
  estimated_time?: string
  confidence_score: number
  insight_tags: string[]
  risk_level: string
  slide_breakdown?: string[]
}

interface Pattern {
  theme: string
  confidence: number
  evidence: string
  frequency: string
}

interface MissedOpportunity {
  opportunity: string
  impact: string
  reasoning: string
  suggestion: string
}

interface OrchestratorResponse {
  hero_insight: HeroInsight
  snapshot_cards: SnapshotCard[]
  strategic_patterns: {
    recurring_themes: Pattern[]
    opportunities: MissedOpportunity[]
    recommendations: string[]
  }
  generated_ideas: {
    total_ideas: number
    idea_cards: IdeaCard[]
  }
  action_plan: {
    immediate_actions: string[]
    long_term_strategy: string[]
    success_metrics: string[]
  }
}

interface ReflectionResponse {
  post_analysis: {
    post_title: string
    format: string
    published_date: string
    time_elapsed: string
    original_intent: string
  }
  performance_data: {
    engagement: {
      likes: number
      saves: number
      comments: number
      shares: number
      reach: number
      impressions: number
    }
    save_rate: string
    engagement_rate: string
    comparison_to_average: {
      likes: string
      saves: string
      engagement_rate: string
    }
  }
  outcome_summary: {
    performance_level: string
    intent_match: string
    standout_metric: string
    summary: string
  }
  learning_statement: {
    primary_insight: string
    supporting_evidence: string[]
    confidence: number
  }
  suggestion: {
    next_action: string
    rationale: string
    suggested_title: string
    expected_impact: string
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Home() {
  // Navigation & Screen State
  const [currentScreen, setCurrentScreen] = useState<'onboarding' | 'studio' | 'contrail' | 'explore' | 'drafts' | 'insights'>('onboarding')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)

  // Onboarding State
  const [platform, setPlatform] = useState('instagram')
  const [contentType, setContentType] = useState('')
  const [goal, setGoal] = useState('')
  const [syncProgress, setSyncProgress] = useState(0)

  // Studio State
  const [heroInsight, setHeroInsight] = useState<HeroInsight | null>(null)
  const [snapshotCards, setSnapshotCards] = useState<SnapshotCard[]>([])
  const [heroExpanded, setHeroExpanded] = useState(false)
  const [studioLoading, setStudioLoading] = useState(false)

  // Contrail State
  const [selectedInsights, setSelectedInsights] = useState<Pattern[]>([])
  const [contrailFormat, setContrailFormat] = useState('carousel')
  const [contrailEffort, setContrailEffort] = useState(50)
  const [contrailTone, setContrailTone] = useState(50)
  const [showFace, setShowFace] = useState(false)
  const [postingTime, setPostingTime] = useState('morning')
  const [allPatterns, setAllPatterns] = useState<Pattern[]>([])

  // Explore State
  const [ideas, setIdeas] = useState<IdeaCard[]>([])
  const [selectedIdea, setSelectedIdea] = useState<IdeaCard | null>(null)
  const [showRefinementPanel, setShowRefinementPanel] = useState(false)
  const [showContextRail, setShowContextRail] = useState(false)
  const [ideaLoading, setIdeaLoading] = useState(false)

  // Refinement Sliders
  const [personalEducational, setPersonalEducational] = useState(50)
  const [softBold, setSoftBold] = useState(50)
  const [shortStory, setShortStory] = useState(50)
  const [useVulnerability, setUseVulnerability] = useState(false)
  const [useControversy, setUseControversy] = useState(false)
  const [usePractical, setUsePractical] = useState(true)

  // Direction Lock Modal
  const [showDirectionLock, setShowDirectionLock] = useState(false)
  const [riskLevel, setRiskLevel] = useState('safe')

  // Drafts State
  const [currentDraft, setCurrentDraft] = useState({
    hook: '',
    body: '',
    cta: ''
  })
  const [draftVersion, setDraftVersion] = useState(1)
  const [autoSaving, setAutoSaving] = useState(false)

  // Pre-Flight State
  const [showPreFlight, setShowPreFlight] = useState(false)
  const [intent, setIntent] = useState('')
  const [preFlightChecks, setPreFlightChecks] = useState({
    grammar: true,
    clarity: true,
    hook_strength: true,
    cta_present: true,
    format_optimized: true
  })

  // Reflection State
  const [showReflection, setShowReflection] = useState(false)
  const [reflectionData, setReflectionData] = useState<ReflectionResponse | null>(null)

  // Agent IDs
  const AGENT_IDS = {
    orchestrator: '69859cc4e5d25ce3f598cc1e',
    contentAnalyzer: '69859c75b37fff3a03c07bde',
    patternDetector: '69859c885eb49186d63e5d97',
    ideaGenerator: '69859ca0ab4bf65a66ad0905',
    reflection: '69859ce5e5d25ce3f598cc1f'
  }

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Load Studio data on mount
  useEffect(() => {
    if (currentScreen === 'studio' && !heroInsight) {
      loadStudioInsights()
    }
  }, [currentScreen])

  // Simulate sync progress
  useEffect(() => {
    if (onboardingStep === 3 && syncProgress < 100) {
      const timer = setTimeout(() => {
        setSyncProgress(prev => {
          const next = prev + 10
          if (next >= 100) {
            setTimeout(() => {
              setCurrentScreen('studio')
              setOnboardingStep(0)
            }, 500)
          }
          return Math.min(next, 100)
        })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [onboardingStep, syncProgress])

  // Auto-save draft
  useEffect(() => {
    if (currentScreen === 'drafts' && (currentDraft.hook || currentDraft.body || currentDraft.cta)) {
      setAutoSaving(true)
      const timer = setTimeout(() => {
        setAutoSaving(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [currentDraft, currentScreen])

  // ============================================================================
  // AGENT INTEGRATION FUNCTIONS
  // ============================================================================

  const loadStudioInsights = async () => {
    setStudioLoading(true)
    try {
      const result = await callAIAgent(
        'Analyze my Instagram content and provide insights for content strategy',
        AGENT_IDS.orchestrator
      )

      if (result.success && result.response?.result) {
        const data = result.response.result as OrchestratorResponse
        setHeroInsight(data.hero_insight)
        setSnapshotCards(data.snapshot_cards)
        setAllPatterns(data.strategic_patterns?.recurring_themes || [])
      }
    } catch (error) {
      console.error('Error loading studio insights:', error)
    } finally {
      setStudioLoading(false)
    }
  }

  const generateIdeas = async () => {
    setIdeaLoading(true)
    try {
      const contrailContext = {
        format: contrailFormat,
        effort: contrailEffort > 66 ? 'High' : contrailEffort > 33 ? 'Medium' : 'Low',
        tone: contrailTone > 66 ? 'Bold' : contrailTone > 33 ? 'Professional' : 'Soft',
        insights: selectedInsights.map(i => i.theme)
      }

      const result = await callAIAgent(
        `Generate content ideas based on these constraints: ${JSON.stringify(contrailContext)}`,
        AGENT_IDS.ideaGenerator
      )

      if (result.success && result.response?.result?.idea_cards) {
        setIdeas(result.response.result.idea_cards)
        setCurrentScreen('explore')
      }
    } catch (error) {
      console.error('Error generating ideas:', error)
    } finally {
      setIdeaLoading(false)
    }
  }

  const loadReflection = async () => {
    try {
      const result = await callAIAgent(
        'Provide reflection on my latest published content',
        AGENT_IDS.reflection
      )

      if (result.success && result.response?.result) {
        setReflectionData(result.response.result as ReflectionResponse)
        setShowReflection(true)
      }
    } catch (error) {
      console.error('Error loading reflection:', error)
    }
  }

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderOnboarding = () => {
    if (onboardingStep === 0) {
      return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-8">
          <Card className="w-full max-w-2xl bg-white">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <FaRocket className="text-[#3B82F6] text-6xl" />
              </div>
              <CardTitle className="text-3xl">Welcome to CreatorPilot</CardTitle>
              <CardDescription className="text-lg mt-2">
                Your AI-powered content strategy assistant for Instagram
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Select your platform</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={platform === 'instagram' ? 'default' : 'outline'}
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setPlatform('instagram')}
                  >
                    <FaInstagram className="text-2xl" />
                    Instagram
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <FaChartLine className="text-2xl" />
                    More Coming Soon
                  </Button>
                </div>
              </div>
              <Button
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB]"
                size="lg"
                onClick={() => setOnboardingStep(1)}
              >
                Continue <FaArrowRight className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (onboardingStep === 1) {
      const types = [
        { id: 'creator', label: 'Creator', icon: FaUser },
        { id: 'educator', label: 'Educator', icon: FaBrain },
        { id: 'brand', label: 'Brand', icon: FaFire },
        { id: 'manager', label: 'Manager', icon: FaCog }
      ]

      return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-8">
          <Card className="w-full max-w-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-2xl">What type of content do you create?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {types.map(type => (
                  <Button
                    key={type.id}
                    variant={contentType === type.id ? 'default' : 'outline'}
                    className="h-24 flex flex-col gap-2"
                    onClick={() => setContentType(type.id)}
                  >
                    <type.icon className="text-3xl" />
                    {type.label}
                  </Button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setOnboardingStep(0)}
                  className="flex-1"
                >
                  <FaArrowLeft className="mr-2" /> Back
                </Button>
                <Button
                  className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB]"
                  onClick={() => setOnboardingStep(2)}
                  disabled={!contentType}
                >
                  Continue <FaArrowRight className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (onboardingStep === 2) {
      const goals = [
        { id: 'reach', label: 'Increase Reach', icon: FaChartLine },
        { id: 'saves', label: 'Get More Saves', icon: FaBookmark },
        { id: 'consistency', label: 'Stay Consistent', icon: FaClock },
        { id: 'deals', label: 'Land Brand Deals', icon: FaTrophy }
      ]

      return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-8">
          <Card className="w-full max-w-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-2xl">What's your main goal?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {goals.map(g => (
                  <Button
                    key={g.id}
                    variant={goal === g.id ? 'default' : 'outline'}
                    className="h-24 flex flex-col gap-2"
                    onClick={() => setGoal(g.id)}
                  >
                    <g.icon className="text-3xl" />
                    {g.label}
                  </Button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setOnboardingStep(1)}
                  className="flex-1"
                >
                  <FaArrowLeft className="mr-2" /> Back
                </Button>
                <Button
                  className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB]"
                  onClick={() => setOnboardingStep(3)}
                  disabled={!goal}
                >
                  Start Analysis <FaArrowRight className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (onboardingStep === 3) {
      return (
        <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-8">
          <Card className="w-full max-w-2xl bg-white">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <FaSync className="text-[#3B82F6] text-6xl animate-spin" />
                </div>
              </div>
              <CardTitle className="text-2xl">Analyzing Your Content</CardTitle>
              <CardDescription className="mt-2">
                Reading your Instagram insights and patterns...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{syncProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#3B82F6] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
              </div>
              <div className="pt-4 space-y-2 text-sm text-gray-600">
                {syncProgress >= 20 && <div className="flex items-center gap-2"><FaCheck className="text-green-500" /> Connected to Instagram</div>}
                {syncProgress >= 40 && <div className="flex items-center gap-2"><FaCheck className="text-green-500" /> Analyzing top posts</div>}
                {syncProgress >= 60 && <div className="flex items-center gap-2"><FaCheck className="text-green-500" /> Detecting patterns</div>}
                {syncProgress >= 80 && <div className="flex items-center gap-2"><FaCheck className="text-green-500" /> Generating insights</div>}
                {syncProgress === 100 && <div className="flex items-center gap-2"><FaCheck className="text-green-500" /> Complete!</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return null
  }

  const renderStudio = () => {
    return (
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Studio</h1>
              <p className="text-gray-400 mt-1">Your content command center</p>
            </div>
            <Button
              variant="outline"
              onClick={loadReflection}
              className="text-white border-gray-600"
            >
              <FaBrain className="mr-2" /> View Reflection
            </Button>
          </div>

          {studioLoading ? (
            <div className="space-y-6">
              <div className="h-64 bg-gray-800 rounded-lg animate-pulse" />
              <div className="grid grid-cols-3 gap-6">
                <div className="h-48 bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-48 bg-gray-800 rounded-lg animate-pulse" />
                <div className="h-48 bg-gray-800 rounded-lg animate-pulse" />
              </div>
            </div>
          ) : (
            <>
              {/* Hero Insight Card */}
              {heroInsight && (
                <Card className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] border-0 text-white">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm opacity-90 mb-2">Key Insight</div>
                        <CardTitle className="text-3xl leading-tight mb-4">
                          {heroInsight.statement}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm opacity-90">
                          <FaCheckCircle />
                          <span>{Math.round(heroInsight.confidence * 100)}% confidence</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setHeroExpanded(!heroExpanded)}
                        className="text-white hover:bg-white/20"
                      >
                        {heroExpanded ? <FaChevronUp /> : <FaChevronDown />}
                      </Button>
                    </div>
                  </CardHeader>
                  {heroExpanded && (
                    <CardContent className="space-y-4 pt-0">
                      <div className="border-t border-white/20 pt-4">
                        <h4 className="font-semibold mb-2">Why it matters:</h4>
                        <p className="text-sm opacity-90">{heroInsight.why_it_matters}</p>
                      </div>
                      <div className="border-t border-white/20 pt-4">
                        <h4 className="font-semibold mb-2">Top Example:</h4>
                        <div className="bg-white/10 rounded-lg p-3 space-y-2">
                          <div className="font-medium">{heroInsight.expandable_details.top_example.post_title}</div>
                          <div className="text-sm opacity-90">{heroInsight.expandable_details.top_example.saves} saves</div>
                          <div className="text-sm opacity-90">{heroInsight.expandable_details.top_example.why_it_worked}</div>
                        </div>
                      </div>
                      <div className="border-t border-white/20 pt-4">
                        <h4 className="font-semibold mb-2">What to do:</h4>
                        <p className="text-sm opacity-90">{heroInsight.expandable_details.what_to_do}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )}

              {/* Snapshot Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {snapshotCards.map((card, idx) => (
                  <Card key={idx} className="bg-white">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs bg-[#3B82F6] text-white px-2 py-1 rounded">
                          {card.tag}
                        </span>
                        {card.type === 'top_post' && <FaTrophy className="text-yellow-500" />}
                        {card.type === 'pattern_detected' && <FaSearchPlus className="text-blue-500" />}
                        {card.type === 'missed_opportunity' && <FaExclamationTriangle className="text-orange-500" />}
                      </div>
                      <CardTitle className="text-xl">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {card.metrics && (
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                              <FaHeart className="text-red-400" />
                              {card.metrics.likes}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                              <FaBookmark className="text-blue-400" />
                              {card.metrics.saves}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-600">{card.metrics.engagement_rate}</div>
                          </div>
                        </div>
                      )}
                      {card.description && (
                        <p className="text-sm text-gray-600 mb-2">{card.description}</p>
                      )}
                      {card.data_point && (
                        <p className="text-xs text-gray-500 mb-2">{card.data_point}</p>
                      )}
                      {card.insight && (
                        <p className="text-sm text-gray-700">{card.insight}</p>
                      )}
                      {card.suggestion && (
                        <p className="text-sm text-gray-700">{card.suggestion}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action CTAs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  size="lg"
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white h-16"
                  onClick={() => setCurrentScreen('contrail')}
                >
                  <FaRocket className="mr-2" /> Set New Contrail
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 text-white border-gray-600"
                  onClick={() => setCurrentScreen('drafts')}
                >
                  <FaFileAlt className="mr-2" /> Continue Last Session
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 text-white border-gray-600"
                  onClick={() => {
                    if (allPatterns.length > 0) {
                      setSelectedInsights(allPatterns.slice(0, 2))
                      generateIdeas()
                    }
                  }}
                >
                  <FaLightbulb className="mr-2" /> Generate Ideas
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  const renderContrail = () => {
    return (
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">Contrail Builder</h1>
            <p className="text-gray-400 mt-1">Build your content strategy foundation</p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Insight Stack */}
            <div className="col-span-3 space-y-4">
              <h3 className="text-lg font-semibold text-white">Insights</h3>
              <div className="space-y-3">
                {allPatterns.map((pattern, idx) => {
                  const isSelected = selectedInsights.some(s => s.theme === pattern.theme)
                  return (
                    <Card
                      key={idx}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#3B82F6] text-white border-[#3B82F6]'
                          : 'bg-white hover:border-[#3B82F6]'
                      }`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedInsights(selectedInsights.filter(s => s.theme !== pattern.theme))
                        } else {
                          setSelectedInsights([...selectedInsights, pattern])
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            isSelected ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {Math.round(pattern.confidence * 100)}% confidence
                          </span>
                          {isSelected && <FaCheckCircle />}
                        </div>
                        <div className="text-sm font-medium">{pattern.theme}</div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Canvas */}
            <div className="col-span-6">
              <h3 className="text-lg font-semibold text-white mb-4">Canvas</h3>
              <Card className="bg-gray-800 border-gray-700 min-h-[500px] p-6">
                {selectedInsights.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <FaLightbulb className="text-5xl mx-auto mb-4 opacity-50" />
                      <p>Select insights to build your contrail</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg p-4 shadow-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold mb-1">{insight.theme}</div>
                            <div className="text-sm text-gray-600">{insight.evidence}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInsights(selectedInsights.filter((_, i) => i !== idx))}
                          >
                            <FaTimes />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Constraints Panel */}
            <div className="col-span-3 space-y-4">
              <h3 className="text-lg font-semibold text-white">Constraints</h3>

              <Card className="bg-white">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Format</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={contrailFormat}
                      onChange={(e) => setContrailFormat(e.target.value)}
                    >
                      <option value="carousel">Carousel</option>
                      <option value="reel">Reel</option>
                      <option value="single">Single Image</option>
                      <option value="story">Story</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Effort Level</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={contrailEffort}
                      onChange={(e) => setContrailEffort(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Tone</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={contrailTone}
                      onChange={(e) => setContrailTone(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Soft</span>
                      <span>Professional</span>
                      <span>Bold</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show Face</label>
                    <button
                      onClick={() => setShowFace(!showFace)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        showFace ? 'bg-[#3B82F6]' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        showFace ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Posting Time</label>
                    <select
                      className="w-full p-2 border rounded"
                      value={postingTime}
                      onChange={(e) => setPostingTime(e.target.value)}
                    >
                      <option value="morning">Morning (6-9 AM)</option>
                      <option value="midday">Midday (12-2 PM)</option>
                      <option value="evening">Evening (6-8 PM)</option>
                      <option value="night">Night (9-11 PM)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB]"
                size="lg"
                disabled={selectedInsights.length === 0 || ideaLoading}
                onClick={generateIdeas}
              >
                {ideaLoading ? (
                  <>
                    <FaSync className="mr-2 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <FaLightbulb className="mr-2" /> Generate Ideas
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderExplore = () => {
    return (
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Explore Ideas</h1>
              <p className="text-gray-400 mt-1">{ideas.length} ideas generated from your contrail</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowContextRail(!showContextRail)}
                className="text-white border-gray-600"
              >
                <FaChartBar className="mr-2" />
                {showContextRail ? 'Hide' : 'Show'} Context
              </Button>
              <Button
                className="bg-[#3B82F6] hover:bg-[#2563EB]"
                onClick={generateIdeas}
                disabled={ideaLoading}
              >
                {ideaLoading ? <FaSync className="animate-spin mr-2" /> : <FaPlus className="mr-2" />}
                Generate More
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideas.map((idea) => (
              <Card key={idea.id} className="bg-white hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs bg-[#3B82F6] text-white px-2 py-1 rounded">
                      {idea.format}
                    </span>
                    <span className="text-xs text-gray-500">{idea.effort_level}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight">{idea.title}</CardTitle>
                  <CardDescription className="text-sm italic mt-2">
                    "{idea.hook}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <strong>Why it works:</strong> {idea.why_it_works}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${idea.confidence_score * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round(idea.confidence_score * 100)}%
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {idea.insight_tags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedIdea(idea)
                          setShowRefinementPanel(true)
                        }}
                      >
                        <FaEdit className="mr-1" /> Tweak
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB]"
                        onClick={() => {
                          setSelectedIdea(idea)
                          setShowDirectionLock(true)
                        }}
                      >
                        <FaSave className="mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Refinement Panel */}
        {showRefinementPanel && selectedIdea && (
          <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl p-6 overflow-auto z-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Refine Idea</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRefinementPanel(false)}
              >
                <FaTimes />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">{selectedIdea.title}</h4>
                <p className="text-sm text-gray-600 italic">"{selectedIdea.hook}"</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Style Balance</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={personalEducational}
                    onChange={(e) => setPersonalEducational(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Personal</span>
                    <span>Educational</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tone</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={softBold}
                    onChange={(e) => setSoftBold(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Soft</span>
                    <span>Bold</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Length</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={shortStory}
                    onChange={(e) => setShortStory(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Short</span>
                    <span>Story-led</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Add Vulnerability</label>
                    <button
                      onClick={() => setUseVulnerability(!useVulnerability)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        useVulnerability ? 'bg-[#3B82F6]' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        useVulnerability ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Add Controversy</label>
                    <button
                      onClick={() => setUseControversy(!useControversy)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        useControversy ? 'bg-[#3B82F6]' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        useControversy ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Practical Takeaway</label>
                    <button
                      onClick={() => setUsePractical(!usePractical)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        usePractical ? 'bg-[#3B82F6]' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        usePractical ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Live Preview</h4>
                <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
                  <p>Updated hook and concept will appear here based on your adjustments...</p>
                </div>
              </div>

              <Button
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB]"
                onClick={() => {
                  setShowRefinementPanel(false)
                  setShowDirectionLock(true)
                }}
              >
                <FaPencilAlt className="mr-2" /> Turn Into Draft
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderDrafts = () => {
    return (
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white">Draft Editor</h1>
              <p className="text-gray-400 mt-1">
                {autoSaving ? 'Saving...' : 'All changes saved'} - Version {draftVersion}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="text-white border-gray-600"
                onClick={() => setDraftVersion(v => v + 1)}
              >
                <FaHistory className="mr-2" /> Version History
              </Button>
              <Button
                className="bg-[#3B82F6] hover:bg-[#2563EB]"
                onClick={() => setShowPreFlight(true)}
              >
                <FaRocket className="mr-2" /> Pre-Flight Check
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Hook</CardTitle>
                  <Button variant="ghost" size="sm">
                    <FaSync className="mr-1" /> Rewrite
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full p-3 border rounded-lg min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Write your attention-grabbing hook..."
                  value={currentDraft.hook}
                  onChange={(e) => setCurrentDraft(prev => ({ ...prev, hook: e.target.value }))}
                />
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{currentDraft.hook.length} characters</span>
                  <div className="flex items-center gap-1">
                    <FaCheckCircle className="text-green-500" />
                    <span>Strong opening</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Body</CardTitle>
                  <Button variant="ghost" size="sm">
                    <FaSync className="mr-1" /> Rewrite
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full p-3 border rounded-lg min-h-[300px] resize-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Write your main content..."
                  value={currentDraft.body}
                  onChange={(e) => setCurrentDraft(prev => ({ ...prev, body: e.target.value }))}
                />
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{currentDraft.body.length} characters</span>
                  <div className="flex items-center gap-1">
                    <FaCheckCircle className="text-green-500" />
                    <span>Good flow</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Call to Action</CardTitle>
                  <Button variant="ghost" size="sm">
                    <FaSync className="mr-1" /> Rewrite
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full p-3 border rounded-lg min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                  placeholder="Write your call to action..."
                  value={currentDraft.cta}
                  onChange={(e) => setCurrentDraft(prev => ({ ...prev, cta: e.target.value }))}
                />
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{currentDraft.cta.length} characters</span>
                  <div className="flex items-center gap-1">
                    <FaCheckCircle className="text-green-500" />
                    <span>Clear CTA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Voice Adjustment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Formality</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Casual</span>
                    <span>Formal</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Energy</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="50"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Calm</span>
                    <span>Energetic</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderInsights = () => {
    return (
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">Insights</h1>
            <p className="text-gray-400 mt-1">Deep analytics and patterns from your content</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allPatterns.map((pattern, idx) => (
              <Card key={idx} className="bg-white">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{pattern.theme}</CardTitle>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {Math.round(pattern.confidence * 100)}% confidence
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Evidence:</div>
                      <div className="text-sm text-gray-600">{pattern.evidence}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-1">Frequency:</div>
                      <div className="text-sm text-gray-600">{pattern.frequency}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // MODALS
  // ============================================================================

  const renderDirectionLockModal = () => {
    if (!showDirectionLock || !selectedIdea) return null

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-2xl">Lock Your Direction</CardTitle>
            <CardDescription>
              Finalize your content strategy before moving to drafts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Selected Idea</h4>
              <div className="text-lg font-medium">{selectedIdea.title}</div>
              <div className="text-sm text-gray-600 mt-1 italic">"{selectedIdea.hook}"</div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Contrail Summary</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Format:</span>
                  <span className="ml-2 font-medium">{selectedIdea.format}</span>
                </div>
                <div>
                  <span className="text-gray-600">Effort:</span>
                  <span className="ml-2 font-medium">{selectedIdea.effort_level}</span>
                </div>
                <div>
                  <span className="text-gray-600">Confidence:</span>
                  <span className="ml-2 font-medium">{Math.round(selectedIdea.confidence_score * 100)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Risk:</span>
                  <span className="ml-2 font-medium">{selectedIdea.risk_level}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Choose Your Risk Level</h4>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={riskLevel === 'safe' ? 'default' : 'outline'}
                  onClick={() => setRiskLevel('safe')}
                  className="h-auto py-4 flex flex-col gap-1"
                >
                  <FaCheckCircle className="text-xl" />
                  <span className="text-sm">Ship Safe</span>
                </Button>
                <Button
                  variant={riskLevel === 'push' ? 'default' : 'outline'}
                  onClick={() => setRiskLevel('push')}
                  className="h-auto py-4 flex flex-col gap-1"
                >
                  <FaRocket className="text-xl" />
                  <span className="text-sm">Push Boundaries</span>
                </Button>
                <Button
                  variant={riskLevel === 'experimental' ? 'default' : 'outline'}
                  onClick={() => setRiskLevel('experimental')}
                  className="h-auto py-4 flex flex-col gap-1"
                >
                  <FaFire className="text-xl" />
                  <span className="text-sm">Experimental</span>
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDirectionLock(false)
                  setSelectedIdea(null)
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB]"
                onClick={() => {
                  setCurrentDraft({
                    hook: selectedIdea.hook,
                    body: selectedIdea.concept || '',
                    cta: ''
                  })
                  setShowDirectionLock(false)
                  setCurrentScreen('drafts')
                }}
              >
                <FaPencilAlt className="mr-2" /> Start Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderPreFlightModal = () => {
    if (!showPreFlight) return null

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl bg-white">
          <CardHeader>
            <CardTitle className="text-2xl">Pre-Flight Check</CardTitle>
            <CardDescription>
              Final quality checks before publishing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Automated Checks</h4>
              <div className="space-y-2">
                {Object.entries(preFlightChecks).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    {value ? (
                      <FaCheckCircle className="text-green-500" />
                    ) : (
                      <FaTimesCircle className="text-red-500" />
                    )}
                    <span className="text-sm capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">What's your intent with this post?</h4>
              <div className="grid grid-cols-2 gap-3">
                {['Teach', 'Connect', 'Spark discussion', 'Test something new'].map(i => (
                  <Button
                    key={i}
                    variant={intent === i ? 'default' : 'outline'}
                    onClick={() => setIntent(i)}
                  >
                    {i}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPreFlight(false)}
              >
                Back to Editing
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!intent}
                onClick={() => {
                  setShowPreFlight(false)
                  alert('Content ready to publish!')
                }}
              >
                <FaCheckCircle className="mr-2" /> Ready to Publish
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderReflectionModal = () => {
    if (!showReflection || !reflectionData) return null

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-3xl bg-white max-h-[90vh] overflow-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Post Reflection</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReflection(false)}
              >
                <FaTimes />
              </Button>
            </div>
            <CardDescription>
              Learn from your published content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-2">{reflectionData.post_analysis.post_title}</h3>
              <div className="flex gap-6 text-sm text-gray-600">
                <div>Format: {reflectionData.post_analysis.format}</div>
                <div>Published: {reflectionData.post_analysis.time_elapsed} ago</div>
                <div>Intent: {reflectionData.post_analysis.original_intent}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {reflectionData.performance_data.engagement.likes}
                  </div>
                  <div className="text-sm text-gray-600">Likes</div>
                  <div className="text-xs text-green-600 mt-1">
                    {reflectionData.performance_data.comparison_to_average.likes}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {reflectionData.performance_data.engagement.saves}
                  </div>
                  <div className="text-sm text-gray-600">Saves</div>
                  <div className="text-xs text-green-600 mt-1">
                    {reflectionData.performance_data.comparison_to_average.saves}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {reflectionData.performance_data.engagement_rate}
                  </div>
                  <div className="text-sm text-gray-600">Engagement</div>
                  <div className="text-xs text-green-600 mt-1">
                    {reflectionData.performance_data.comparison_to_average.engagement_rate}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h4 className="font-semibold mb-2">Performance Summary</h4>
              <p className="text-sm text-gray-700">{reflectionData.outcome_summary.summary}</p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <h4 className="font-semibold mb-2">Key Learning</h4>
              <p className="text-sm text-gray-700 mb-3">{reflectionData.learning_statement.primary_insight}</p>
              <div className="text-xs text-gray-600">
                Confidence: {Math.round(reflectionData.learning_statement.confidence * 100)}%
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <h4 className="font-semibold mb-2">Suggestion for Next Content</h4>
              <p className="text-sm font-medium text-gray-800 mb-1">
                {reflectionData.suggestion.suggested_title}
              </p>
              <p className="text-sm text-gray-700 mb-2">{reflectionData.suggestion.rationale}</p>
              <p className="text-xs text-gray-600">Expected: {reflectionData.suggestion.expected_impact}</p>
            </div>

            <Button
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB]"
              onClick={() => {
                setShowReflection(false)
                setCurrentScreen('contrail')
              }}
            >
              <FaRocket className="mr-2" /> Apply This Learning
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ============================================================================
  // LAYOUT
  // ============================================================================

  if (currentScreen === 'onboarding') {
    return renderOnboarding()
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gray-900 border-r border-gray-800 transition-all flex flex-col`}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <FaRocket className="text-[#3B82F6] text-2xl" />
              <span className="text-white font-bold text-lg">CreatorPilot</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-400 hover:text-white"
          >
            {sidebarCollapsed ? <FaBars /> : <FaTimes />}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: 'studio', label: 'Studio', icon: FaChartBar },
            { id: 'contrail', label: 'Contrail', icon: FaRocket },
            { id: 'explore', label: 'Explore', icon: FaLightbulb },
            { id: 'drafts', label: 'Drafts', icon: FaPencilAlt },
            { id: 'insights', label: 'Insights', icon: FaBrain }
          ].map(item => (
            <Button
              key={item.id}
              variant={currentScreen === item.id ? 'default' : 'ghost'}
              className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-4'} ${
                currentScreen === item.id
                  ? 'bg-[#3B82F6] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              onClick={() => setCurrentScreen(item.id as any)}
            >
              <item.icon className={sidebarCollapsed ? '' : 'mr-3'} />
              {!sidebarCollapsed && item.label}
            </Button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <Button
            variant="ghost"
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-4'} text-gray-400 hover:text-white hover:bg-gray-800`}
          >
            <FaCog className={sidebarCollapsed ? '' : 'mr-3'} />
            {!sidebarCollapsed && 'Settings'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-8">
          <div className="text-gray-400 text-sm">
            Instagram Creator Dashboard
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center">
              <FaUser className="text-white" />
            </div>
          </div>
        </div>

        {/* Screen Content */}
        {currentScreen === 'studio' && renderStudio()}
        {currentScreen === 'contrail' && renderContrail()}
        {currentScreen === 'explore' && renderExplore()}
        {currentScreen === 'drafts' && renderDrafts()}
        {currentScreen === 'insights' && renderInsights()}
      </div>

      {/* Modals */}
      {renderDirectionLockModal()}
      {renderPreFlightModal()}
      {renderReflectionModal()}
    </div>
  )
}
