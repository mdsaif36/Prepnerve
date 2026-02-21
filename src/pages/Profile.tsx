import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Edit, Upload, ArrowLeft, User as UserIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const getInitials = (name: string): string => {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return words.map(word => word.charAt(0).toUpperCase()).join("").slice(0, 2);
};

interface Profile {
  username: string;
  email: string;
  bio: string | null;
  avatar_url: string | null;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
      return;
    }

    setProfile(data);
    setUsername(data.username);
    setBio(data.bio || "");
    setAvatarUrl(data.avatar_url);
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${Math.random()}.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user?.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      toast({
        title: "Success",
        description: "Avatar updated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ username, bio })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setIsEditing(false);
      fetchProfile();
    }
    setIsSaving(false);
  };

  if (loading || !profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button
            variant="glass"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="glass rounded-3xl p-8 space-y-6">
            {/* Profile Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Profile</h1>
              <Button
                variant={isEditing ? "glass" : "neon"}
                onClick={() => {
                  if (isEditing) {
                    setUsername(profile.username);
                    setBio(profile.bio || "");
                  }
                  setIsEditing(!isEditing);
                }}
              >
                {isEditing ? "Cancel" : <><Edit className="w-4 h-4 mr-2" />Edit</>}
              </Button>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-2 border-neon-cyan/30">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 text-foreground text-4xl font-bold">
                    {getInitials(username)}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={uploading}
                  >
                    <Upload className="w-8 h-8 text-neon-cyan" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                className="hidden"
                disabled={uploading}
              />
              {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground uppercase tracking-wider mb-2 block">
                  Username
                </label>
                {isEditing ? (
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-input border-glass-border/30 h-12 rounded-xl text-foreground"
                  />
                ) : (
                  <div className="flex items-center gap-3 glass rounded-xl p-4">
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground text-lg">{profile.username}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground uppercase tracking-wider mb-2 block">
                  Email
                </label>
                <div className="flex items-center gap-3 glass rounded-xl p-4">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground text-lg">{profile.email}</span>
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground uppercase tracking-wider mb-2 block">
                  Bio
                </label>
                {isEditing ? (
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="bg-input border-glass-border/30 rounded-xl text-foreground min-h-32"
                  />
                ) : (
                  <div className="glass rounded-xl p-4">
                    <p className="text-foreground">
                      {profile.bio || "No bio yet. Click Edit to add one!"}
                    </p>
                  </div>
                )}
              </div>

              {isEditing && (
                <Button
                  variant="neon"
                  className="w-full h-12"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
