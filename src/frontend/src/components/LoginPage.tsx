import { Button } from "@/components/ui/button";
import { BookOpen, FileText, MessageCircle, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface LoginPageProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

export function LoginPage({ onLogin, isLoggingIn }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Branding */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col gap-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-display tracking-tight text-foreground">
              NoteWise
            </span>
          </div>

          <div>
            <h1 className="text-4xl font-display text-foreground leading-tight mb-4">
              Summarize notes,
              <br />
              <span className="text-primary">solve any doubt</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Upload your study notes or documents. Get AI-powered summaries and
              ask questions to deepen your understanding.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: FileText,
                label: "Upload Notes",
                desc: "PDF, images, text files",
              },
              {
                icon: Sparkles,
                label: "AI Summaries",
                desc: "Instant key insights",
              },
              {
                icon: MessageCircle,
                label: "Ask Doubts",
                desc: "Chat with your notes",
              },
              {
                icon: BookOpen,
                label: "Study Smart",
                desc: "Learn more efficiently",
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border"
              >
                <div className="w-8 h-8 rounded-md bg-accent flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Login card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
        >
          <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome back
              </h2>
              <p className="text-muted-foreground text-sm">
                Sign in securely to access your notes and AI tools.
              </p>
            </div>

            <Button
              data-ocid="login.primary_button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="w-full h-12 text-base font-semibold rounded-xl"
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Powered by Internet Identity — secure, private, no passwords.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
