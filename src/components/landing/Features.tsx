import { motion } from "framer-motion";
import { Brain, Tag, Search, Lock, Zap, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "AI Summaries",
    description: "Get instant summaries of long notes with advanced AI technology.",
  },
  {
    icon: Tag,
    title: "Smart Tagging",
    description: "Automatically categorize and tag notes based on content.",
  },
  {
    icon: Search,
    title: "Semantic Search",
    description: "Find notes by meaning, not just keywords. Search smarter.",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description: "Your notes are encrypted and stored securely in the cloud.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Create and find notes instantly with optimized performance.",
  },
  {
    icon: FileText,
    title: "Rich Editor",
    description: "Beautiful, distraction-free writing experience with markdown support.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}stay organized
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make note-taking effortless and intelligent.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="p-6 card-shadow hover:card-shadow-lg transition-smooth hover:scale-105 h-full bg-card border-border">
                <div className="w-12 h-12 rounded-lg hero-gradient flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
