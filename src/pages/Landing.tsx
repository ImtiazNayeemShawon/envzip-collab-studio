import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  Shield, 
  Zap, 
  Users, 
  GitBranch, 
  Terminal, 
  Globe, 
  Lock,
  CheckCircle,
  ArrowRight,
  Star,
  Github
} from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Terminal className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold font-mono text-primary">envzip</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="hover:bg-accent">Login</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-mono">
              <Zap className="h-4 w-4 mr-2" />
              Real-time Environment Sync
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 font-mono">
              Sync <span className="text-primary">Environment Variables</span>
              <br />
              Across Your Team
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Secure, real-time synchronization of .env files with version control, 
              team collaboration, and enterprise-grade security.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8">
                  Start for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="https://github.com/ImtiazNayeemShawon/envzip-collab-studio" >
              <Button variant="outline" size="lg" className="h-12 px-8">
                <Github className="mr-2 h-5 w-5" />
                View on GitHub
              </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="bg-card border border-border rounded-lg p-6 shadow-2xl">
              <div className="bg-code-bg rounded-md p-4 font-mono text-sm">
                <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                  <div className="h-3 w-3 rounded-full bg-destructive"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="ml-2">.env.production</span>
                </div>
                <div className="space-y-2">
                  <div><span className="text-blue-400">DATABASE_URL</span>=<span className="text-green-400">"postgresql://..."</span></div>
                  <div><span className="text-blue-400">API_KEY</span>=<span className="text-green-400">"••••••••••••"</span></div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">REDIS_URL</span>=<span className="text-green-400">"redis://..."</span>
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">john@dev editing</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 bg-primary/10 backdrop-blur border border-primary/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-primary font-mono">3 devs online</span>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-accent/10 backdrop-blur border border-accent/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-accent-foreground">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-mono text-green-500">Synced 2s ago</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-mono">Built for Developers</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to manage environment variables at scale
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass border-border/50">
              <CardHeader>
                <Zap className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-mono">Real-time Sync</CardTitle>
                <CardDescription>
                  Instant synchronization across all environments with live collaboration indicators
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-mono">Enterprise Security</CardTitle>
                <CardDescription>
                  AES-256 encryption, role-based access, and audit logs for complete security
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <GitBranch className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-mono">Version Control</CardTitle>
                <CardDescription>
                  Full version history with diff views and one-click rollbacks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-mono">Team Collaboration</CardTitle>
                <CardDescription>
                  Real-time editing with conflict resolution and team member indicators
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <Terminal className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-mono">CLI Integration</CardTitle>
                <CardDescription>
                  Powerful command-line tools for seamless integration with your workflow
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-border/50">
              <CardHeader>
                <Globe className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-mono">Multi-Environment</CardTitle>
                <CardDescription>
                  Manage dev, staging, and production environments from a single dashboard
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" id="pricing">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 font-mono">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">
              Choose the plan that scales with your team
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-border">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-mono">Developer</CardTitle>
                <div className="text-4xl font-bold mt-4">
                  $0<span className="text-lg text-muted-foreground">/month</span>
                </div>
                <CardDescription>Perfect for personal projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>3 Projects</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>5 Team Members</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Basic Version Control</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Community Support</span>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Get Started Free
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-primary bg-primary/5 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  <Star className="h-3 w-3 mr-1" />
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-mono">Team</CardTitle>
                <div className="text-4xl font-bold mt-4">
                  $29<span className="text-lg text-muted-foreground">/month</span>
                </div>
                <CardDescription>For growing development teams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Unlimited Projects</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>25 Team Members</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Advanced Version Control</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Priority Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>API Access</span>
                </div>
                <Button className="w-full mt-6 bg-primary hover:bg-primary/90">
                  Start for free
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-border">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-mono">Enterprise</CardTitle>
                <div className="text-4xl font-bold mt-4">
                  $99<span className="text-lg text-muted-foreground">/month</span>
                </div>
                <CardDescription>For large organizations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Unlimited Everything</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>SSO Integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Audit Logs</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Custom Integrations</span>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 font-mono">
            Ready to Sync Your Environment?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers who trust envzip for their environment management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 h-12 px-8">
                Start for free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 px-8">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Terminal className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold font-mono text-primary">envzip</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Docs</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;