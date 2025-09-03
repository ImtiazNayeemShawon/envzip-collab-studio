import { useState } from "react";
import { User, Bell, Shield, Key, Palette, Globe, Save, Eye, EyeOff, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: "John Doe",
      email: "john.doe@company.com",
      bio: "Senior Developer focused on DevOps and automation tools.",
      timezone: "America/New_York"
    },
    notifications: {
      emailOnChange: true,
      emailOnConflict: true,
      slackIntegration: false,
      discordIntegration: false
    },
    security: {
      twoFactorEnabled: true,
      sessionTimeout: "8h",
      apiKeyRotation: "30d"
    },
    preferences: {
      theme: "dark",
      codeFont: "JetBrains Mono",
      compactView: false,
      autoSave: true
    }
  });

  const handleSave = (section: string) => {
    toast({
      title: "Settings saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  const generateNewApiKey = () => {
    toast({
      title: "API Key Generated",
      description: "A new API key has been generated. Please save it securely.",
    });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Palette className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" className="border-border">
                      Change Avatar
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={settings.profile.name}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, name: e.target.value }
                      })}
                      className="bg-card border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => setSettings({
                        ...settings,
                        profile: { ...settings.profile, email: e.target.value }
                      })}
                      className="bg-card border-border"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={settings.profile.bio}
                    onChange={(e) => setSettings({
                      ...settings,
                      profile: { ...settings.profile, bio: e.target.value }
                    })}
                    rows={3}
                    className="bg-card border-border"
                  />
                </div>

                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.profile.timezone} onValueChange={(value) => setSettings({
                    ...settings,
                    profile: { ...settings.profile, timezone: value }
                  })}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time (EST)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CST)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MST)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PST)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={() => handleSave("Profile")} className="bg-primary hover:bg-primary-hover">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email on Variable Changes</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications when variables are modified
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailOnChange}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, emailOnChange: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email on Conflicts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when merge conflicts occur
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailOnConflict}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, emailOnConflict: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Slack Integration</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications to your Slack workspace
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.slackIntegration}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, slackIntegration: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Discord Integration</Label>
                      <p className="text-sm text-muted-foreground">
                        Send notifications to your Discord server
                      </p>
                    </div>
                    <Switch
                      checked={settings.notifications.discordIntegration}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, discordIntegration: checked }
                      })}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave("Notification")} className="bg-primary hover:bg-primary-hover">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="status-synced">Enabled</Badge>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>

                  <div>
                    <Label>Session Timeout</Label>
                    <Select value={settings.security.sessionTimeout} onValueChange={(value) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: value }
                    })}>
                      <SelectTrigger className="bg-card border-border mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 hour</SelectItem>
                        <SelectItem value="4h">4 hours</SelectItem>
                        <SelectItem value="8h">8 hours</SelectItem>
                        <SelectItem value="24h">24 hours</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>API Key Rotation</Label>
                    <Select value={settings.security.apiKeyRotation} onValueChange={(value) => setSettings({
                      ...settings,
                      security: { ...settings.security, apiKeyRotation: value }
                    })}>
                      <SelectTrigger className="bg-card border-border mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Weekly</SelectItem>
                        <SelectItem value="30d">Monthly</SelectItem>
                        <SelectItem value="90d">Quarterly</SelectItem>
                        <SelectItem value="never">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={() => handleSave("Security")} className="bg-primary hover:bg-primary-hover">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys */}
          <TabsContent value="api">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">Primary API Key</h4>
                        <p className="text-sm text-muted-foreground">
                          Used for programmatic access to EnvSync
                        </p>
                      </div>
                      <Badge variant="secondary" className="status-synced">Active</Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value="es_1234567890abcdef1234567890abcdef"
                        readOnly
                        className="font-mono bg-muted/30 border-border"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="h-10 w-10 p-0"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={generateNewApiKey}>
                        Regenerate
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      Created on Jan 15, 2024 • Last used 2 hours ago
                    </p>
                  </div>

                  <div className="p-4 border border-dashed border-border rounded-lg text-center">
                    <Key className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Create additional API keys for different environments or applications
                    </p>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New API Key
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Code Font</Label>
                    <Select value={settings.preferences.codeFont} onValueChange={(value) => setSettings({
                      ...settings,
                      preferences: { ...settings.preferences, codeFont: value }
                    })}>
                      <SelectTrigger className="bg-card border-border mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                        <SelectItem value="Fira Code">Fira Code</SelectItem>
                        <SelectItem value="Source Code Pro">Source Code Pro</SelectItem>
                        <SelectItem value="Monaco">Monaco</SelectItem>
                        <SelectItem value="Cascadia Code">Cascadia Code</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Compact View</Label>
                      <p className="text-sm text-muted-foreground">
                        Show more content in less space
                      </p>
                    </div>
                    <Switch
                      checked={settings.preferences.compactView}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, compactView: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-save Changes</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save changes as you type
                      </p>
                    </div>
                    <Switch
                      checked={settings.preferences.autoSave}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        preferences: { ...settings.preferences, autoSave: checked }
                      })}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave("Preference")} className="bg-primary hover:bg-primary-hover">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;