import { useState, type JSX } from 'react';
import { Copy, Check, ChevronRight, Trophy, Target, Zap } from 'lucide-react';
import type { Question } from '../logic/questions';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface SessionResult {
  questionId: string;
  score: number;
  rating: 'known' | 'almost' | 'again' | '';
  category: string;
}

interface SessionSummaryProps {
  results: SessionResult[];
  questions: Question[];
  masteryPercent: number;
  onRetryQuestion: (question: Question) => void;
  onNewSession: () => void;
}

export function SessionSummary({
  results,
  questions,
  masteryPercent,
  onRetryQuestion,
  onNewSession,
}: SessionSummaryProps): JSX.Element | null {
  const [copied, setCopied] = useState(false);

  if (!results.length) return null;

  const knownCount = results.filter(r => r.rating === 'known').length;
  const almostCount = results.filter(r => r.rating === 'almost').length;
  const againCount = results.filter(r => r.rating === 'again').length;

  const getCareerTitle = (percent: number) => {
    if (percent >= 100) return 'Partner';
    if (percent >= 80) return 'Manager';
    if (percent >= 60) return 'Senior Consultant';
    if (percent >= 40) return 'Consultant';
    if (percent >= 20) return 'Junior Associate';
    return 'Intern';
  };

  const careerTitle = getCareerTitle(masteryPercent);
  const missedResults = results.filter(r => r.rating === 'again' || r.rating === 'almost');

  const shareText = `Jag slutförde precis en studiesession i Affärsmannaquizet! Kan ${knownCount} av ${results.length} frågor perfekt. Nivå: ${careerTitle}.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sessionFeel = knownCount === results.length
    ? { icon: Trophy, label: 'Perfekt session!', variant: 'success' as const }
    : knownCount >= results.length * 0.7
    ? { icon: Target, label: 'Bra jobbat!', variant: 'accent' as const }
    : { icon: Zap, label: 'Fortsätt öva!', variant: 'warning' as const };

  const FeelIcon = sessionFeel.icon;

  return (
    <div className="max-w-xl mx-auto w-full px-4 py-6 space-y-4 card-enter">
      <Card className="text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-success/5 pointer-events-none" />

        <div className="relative">
          <FeelIcon size={36} className={`mx-auto mb-3 ${sessionFeel.variant === 'success' ? 'text-success' : sessionFeel.variant === 'warning' ? 'text-warning' : 'text-accent'}`} />
          <h2 className="font-display text-xl font-bold text-text-primary mb-1">{sessionFeel.label}</h2>
          <p className="text-sm text-text-muted mb-5">
            Session klar · <Badge variant="accent">{careerTitle}</Badge>
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-success-muted/20 border border-success/25">
              <p className="text-2xl font-display font-bold text-success">{knownCount}</p>
              <p className="text-xs text-success mt-0.5">Kan</p>
            </div>
            <div className="p-3 rounded-xl bg-warning-muted/20 border border-warning/25">
              <p className="text-2xl font-display font-bold text-warning">{almostCount}</p>
              <p className="text-xs text-warning mt-0.5">Nästan</p>
            </div>
            <div className="p-3 rounded-xl bg-danger-muted/20 border border-danger/25">
              <p className="text-2xl font-display font-bold text-danger">{againCount}</p>
              <p className="text-xs text-danger mt-0.5">Igen</p>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button
              onClick={handleCopy}
              variant="secondary"
              size="sm"
              className={copied ? 'border-success text-success' : ''}
            >
              {copied ? <Check size={13} className="mr-1.5" /> : <Copy size={13} className="mr-1.5" />}
              {copied ? 'Kopierat!' : 'Kopiera'}
            </Button>
            <Button
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank')}
              variant="secondary"
              size="sm"
            >
              Dela på X
            </Button>
          </div>
        </div>
      </Card>

      {missedResults.length > 0 && (
        <Card padding="sm">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Repetera dessa ({missedResults.length} st)
          </h3>
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {missedResults.map(res => {
              const q = questions.find(item => item.id === res.questionId);
              if (!q) return null;
              const isAlmost = res.rating === 'almost';
              return (
                <button
                  key={res.questionId}
                  type="button"
                  onClick={() => onRetryQuestion(q)}
                  className="flex items-center w-full p-2.5 rounded-xl bg-surface border border-border text-left hover:border-accent/40 hover:bg-accent-subtle cursor-pointer transition-colors"
                >
                  <Badge variant={isAlmost ? 'warning' : 'danger'} className="shrink-0 mr-2.5">
                    {isAlmost ? 'Nästan' : 'Igen'}
                  </Badge>
                  <span className="truncate flex-1 text-sm text-text-secondary">{q.question}</span>
                  <ChevronRight size={13} className="text-text-muted shrink-0 ml-1" />
                </button>
              );
            })}
          </div>
        </Card>
      )}

      <Button onClick={onNewSession} size="lg" fullWidth>
        Ny session →
      </Button>
    </div>
  );
}