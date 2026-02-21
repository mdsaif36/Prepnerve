import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface IncompleteInterviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  questionsAnswered: number;
}

const IncompleteInterviewDialog = ({
  open,
  onOpenChange,
  onConfirm,
  questionsAnswered
}: IncompleteInterviewDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass border border-border/50">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-yellow-500/20">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <AlertDialogTitle className="text-xl">Interview Not Complete</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground space-y-3">
            <p>
              You've only answered <span className="font-semibold text-foreground">{questionsAnswered} question{questionsAnswered !== 1 ? 's' : ''}</span> so far.
            </p>
            <p>
              Ending the interview now means you won't receive accurate performance results. 
              We recommend completing more questions to get meaningful feedback on your interview skills.
            </p>
            <div className="glass rounded-lg p-3 border border-yellow-500/30 mt-4">
              <p className="text-sm text-yellow-400">
                💡 Tip: Try to answer at least 5-6 questions for a comprehensive assessment of your strengths and areas for improvement.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel className="border-border/50">
            Continue Interview
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/50"
          >
            End Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default IncompleteInterviewDialog;
