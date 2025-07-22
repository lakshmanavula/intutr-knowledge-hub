import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  FileText,
  List,
  Edit3,
  ArrowUpDown,
  ImageIcon,
  Type,
  Calculator,
} from "lucide-react";

interface QuizQuestion {
  id?: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer?: string | string[] | number;
  explanation?: string;
  points?: number;
  difficulty?: "easy" | "medium" | "hard";
  timeLimit?: number;
  hint?: string;
  image?: string;
  pairs?: { left: string; right: string }[];
  sequence?: string[];
  fillInBlanks?: { text: string; blanks: string[] };
}

interface QuizData {
  title?: string;
  description?: string;
  instructions?: string;
  timeLimit?: number;
  totalPoints?: number;
  passingScore?: number;
  questions: QuizQuestion[];
  settings?: {
    randomizeQuestions?: boolean;
    randomizeOptions?: boolean;
    allowRetry?: boolean;
    showCorrectAnswers?: boolean;
  };
}

interface QuizRendererProps {
  content: string;
  isPreview?: boolean;
}

const getQuestionTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'mcq':
    case 'multiple-choice':
      return <List className="w-4 h-4" />;
    case 'mcqm':
    case 'multiple-select':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'tof':
    case 'true-false':
      return <HelpCircle className="w-4 h-4" />;
    case 'fitb':
    case 'fill-in-blanks':
      return <Edit3 className="w-4 h-4" />;
    case 'mtf':
    case 'match-the-following':
      return <ArrowUpDown className="w-4 h-4" />;
    case 'seq':
    case 'sequencing':
      return <List className="w-4 h-4" />;
    case 'short':
    case 'short-answer':
      return <FileText className="w-4 h-4" />;
    case 'essay':
      return <FileText className="w-4 h-4" />;
    case 'num':
    case 'numerical':
      return <Calculator className="w-4 h-4" />;
    case 'pic':
    case 'image':
      return <ImageIcon className="w-4 h-4" />;
    default:
      return <Type className="w-4 h-4" />;
  }
};

const getQuestionTypeBadgeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'mcq':
    case 'multiple-choice':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'mcqm':
    case 'multiple-select':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'tof':
    case 'true-false':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'fitb':
    case 'fill-in-blanks':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'mtf':
    case 'match-the-following':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'seq':
    case 'sequencing':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    case 'short':
    case 'short-answer':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
    case 'essay':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'num':
    case 'numerical':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
    case 'pic':
    case 'image':
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const QuestionRenderer = ({ question, index }: { question: QuizQuestion; index: number }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>("");
  const [showExplanation, setShowExplanation] = useState(false);

  const renderQuestionContent = () => {
    switch (question.type.toLowerCase()) {
      case 'mcq':
      case 'multiple-choice':
        return (
          <RadioGroup value={selectedAnswer as string} onValueChange={setSelectedAnswer}>
            {question.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`q${index}-${idx}`} />
                <Label htmlFor={`q${index}-${idx}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'mcqm':
      case 'multiple-select':
        return (
          <div className="space-y-2">
            {question.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox id={`q${index}-${idx}`} />
                <Label htmlFor={`q${index}-${idx}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'tof':
      case 'true-false':
        return (
          <RadioGroup value={selectedAnswer as string} onValueChange={setSelectedAnswer}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`q${index}-true`} />
              <Label htmlFor={`q${index}-true`}>True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`q${index}-false`} />
              <Label htmlFor={`q${index}-false`}>False</Label>
            </div>
          </RadioGroup>
        );

      case 'fitb':
      case 'fill-in-blanks':
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Fill in the blanks:</p>
            {question.fillInBlanks?.blanks.map((blank, idx) => (
              <Input key={idx} placeholder={`Blank ${idx + 1}`} className="max-w-xs" />
            ))}
          </div>
        );

      case 'mtf':
      case 'match-the-following':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Column A</h4>
              {question.pairs?.map((pair, idx) => (
                <div key={idx} className="p-2 border rounded">{pair.left}</div>
              ))}
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Column B</h4>
              {question.pairs?.map((pair, idx) => (
                <div key={idx} className="p-2 border rounded">{pair.right}</div>
              ))}
            </div>
          </div>
        );

      case 'seq':
      case 'sequencing':
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Arrange in correct order:</p>
            {question.sequence?.map((item, idx) => (
              <div key={idx} className="p-2 border rounded flex items-center justify-between">
                <span>{item}</span>
                <Button variant="ghost" size="sm">↕</Button>
              </div>
            ))}
          </div>
        );

      case 'short':
      case 'short-answer':
        return <Input placeholder="Enter your short answer..." />;

      case 'essay':
        return <Textarea placeholder="Write your essay answer..." className="min-h-32" />;

      case 'num':
      case 'numerical':
        return <Input type="number" placeholder="Enter numerical answer..." className="max-w-xs" />;

      default:
        return <Input placeholder="Enter your answer..." />;
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getQuestionTypeBadgeColor(question.type)}>
                {getQuestionTypeIcon(question.type)}
                <span className="ml-1">{question.type.toUpperCase()}</span>
              </Badge>
              {question.points && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {question.points} pts
                </Badge>
              )}
              {question.difficulty && (
                <Badge 
                  variant={question.difficulty === 'easy' ? 'outline' : 
                           question.difficulty === 'medium' ? 'secondary' : 'destructive'}
                >
                  {question.difficulty}
                </Badge>
              )}
              {question.timeLimit && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {question.timeLimit}s
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-medium">Question {index + 1}</h3>
            <p className="text-muted-foreground">{question.question}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {question.image && (
          <div className="mb-4">
            <img 
              src={question.image} 
              alt="Question image" 
              className="max-w-full h-auto rounded border"
            />
          </div>
        )}
        
        {renderQuestionContent()}

        {question.hint && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <p className="text-sm"><strong>Hint:</strong> {question.hint}</p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button size="sm" onClick={() => setShowExplanation(!showExplanation)}>
            {showExplanation ? 'Hide' : 'Show'} Explanation
          </Button>
        </div>

        {showExplanation && question.explanation && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">Explanation</p>
                <p className="text-sm text-green-700 dark:text-green-300">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function QuizRenderer({ content, isPreview = true }: QuizRendererProps) {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useState(() => {
    try {
      const parsed = JSON.parse(content);
      setQuizData(parsed);
      setError(null);
    } catch (err) {
      setError("Failed to parse quiz data");
      console.error("Quiz parsing error:", err);
    }
  });

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-destructive">
            <XCircle className="w-4 h-4" />
            <span>Error: {error}</span>
          </div>
          <details className="mt-2">
            <summary className="text-sm text-muted-foreground cursor-pointer">Raw content</summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
              {content}
            </pre>
          </details>
        </CardContent>
      </Card>
    );
  }

  if (!quizData) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <HelpCircle className="w-4 h-4" />
            <span>Loading quiz data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            {quizData.title || "Quiz"}
          </CardTitle>
          {quizData.description && (
            <p className="text-muted-foreground">{quizData.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {quizData.timeLimit && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{quizData.timeLimit} minutes</span>
              </div>
            )}
            {quizData.totalPoints && (
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-muted-foreground" />
                <span>{quizData.totalPoints} points</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span>{quizData.questions?.length || 0} questions</span>
            </div>
            {quizData.passingScore && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                <span>{quizData.passingScore}% to pass</span>
              </div>
            )}
          </div>

          {quizData.instructions && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Instructions:</p>
              <p className="text-sm">{quizData.instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Questions */}
      {quizData.questions?.map((question, index) => (
        <QuestionRenderer key={index} question={question} index={index} />
      ))}

      {(!quizData.questions || quizData.questions.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No questions found in this quiz</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}