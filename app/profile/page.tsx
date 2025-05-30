"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  getUserStories, // Import getUserStories
} from "@/lib/firebase/firestore";
import type { UserProfile, UserStory } from "@/lib/types"; // Import UserStory
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AuthCheck from "@/components/auth-check";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Import Tabs components
import UserStoryCard from "@/components/cards/user-story-card"; // Import UserStoryCard

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'stories'>('profile'); // New state for active tab
  const [userStories, setUserStories] = useState<UserStory[]>([]); // New state for user stories
  const [currentPage, setCurrentPage] = useState(1); // New state for pagination
  const [storiesPerPage] = useState(6); // Number of stories per page

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    x: "",
    instagram: "",
    tiktok: "",
    website: "", // Add website to formData
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            displayName: userProfile.displayName,
            bio: userProfile.bio || "",
            x: userProfile.socialLinks?.x || "",
            instagram: userProfile.socialLinks?.instagram || "",
            tiktok: userProfile.socialLinks?.tiktok || "",
            website: userProfile.website || "", // Set website from profile
          });
        }
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  useEffect(() => {
    const loadUserStories = async () => {
      console.log(`[ProfilePage] loadUserStories called. user: ${user?.uid}, activeTab: ${activeTab}`);
      if (user && activeTab === 'stories') {
        setLoading(true);
        try {
          const stories = await getUserStories(user.uid);
          console.log("[ProfilePage] Fetched stories:", stories);
          setUserStories(stories);
        } catch (error) {
          console.error("Error loading user stories:", error);
          toast({
            title: "Error",
            description: "Failed to load your stories. Please try again.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserStories();
  }, [user, activeTab, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const profileData: UserProfile = {
        id: user.uid,
        displayName: formData.displayName || user.displayName || "User",
        email: user.email || "",
        bio: formData.bio,
        avatar: profile?.avatar || "",
        socialLinks: {
          x: formData.x,
          instagram: formData.instagram,
          tiktok: formData.tiktok,
        },
        website: formData.website, // Include website from formData
      };

      try {
        await updateUserProfile(user.uid, profileData);
      } catch (error) {
        await createUserProfile(user.uid, profileData);
      }

      const newProfile = await getUserProfile(user.uid);
      setProfile(newProfile);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Your profile has been updated",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
 
  const indexOfLastStory = currentPage * storiesPerPage;
  const indexOfFirstStory = indexOfLastStory - storiesPerPage;
  const currentStories = userStories.slice(indexOfFirstStory, indexOfLastStory);
  const totalPages = Math.ceil(userStories.length / storiesPerPage);

  return (
    <AuthCheck>
      <div className="container mx-auto px-4 py-6 max-w-2xl font-sans">
        <div className="rounded-3xl bg-slate-50 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-md">
          <div className="bg-gradient-to-r from-blue-100 to-purple-200 rounded-t-3xl p-6 pt-16 pb-12">
            <div className="absolute top-6 right-6">
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Button>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full border-2 border-white shadow-lg w-24 h-24 overflow-hidden mb-4">
                <img
                  src={profile?.avatar || "/placeholder-user.jpg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                {profile?.displayName}
              </h1>
            </div>
          </div>

          <div className="p-6">
            <Tabs defaultValue="profile" value={activeTab} onValueChange={(value) => setActiveTab(value as 'profile' | 'stories')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="stories">My Stories</TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 space-y-2">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Display Name
                      </label>
                      <Input
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        required
                        className="rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50"
                      />
                    </div>

                    <div className="rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 space-y-2">
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Bio
                      </label>
                      <Textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={4}
                        className="rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50"
                      />
                    </div>

                    <div className="rounded-2xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-4 space-y-4">
                      <h3 className="text-base font-medium text-gray-500 dark:text-gray-400">
                        Social Links
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            X (Twitter) Username
                          </label>
                          <Input
                            name="x"
                            value={formData.x}
                            onChange={handleChange}
                            className="rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Instagram Username
                          </label>
                          <Input
                            name="instagram"
                            value={formData.instagram}
                            onChange={handleChange}
                            className="rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            TikTok Username
                          </label>
                          <Input
                            name="tiktok"
                            value={formData.tiktok}
                            onChange={handleChange}
                            className="rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Website
                          </label>
                          <Input
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="rounded-xl border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-900/50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 rounded-xl py-2.5"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 rounded-xl bg-blue-500 hover:bg-blue-600 text-white py-2.5"
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center my-6">
                      <p className="text-gray-700 dark:text-gray-300 max-w-lg mx-auto" style={{ maxWidth: '120ch' }}>
                        {profile?.bio || "No bio yet"}
                      </p>
                    </div>

                    <div className="flex justify-center gap-4 my-8">
                      {profile?.socialLinks?.x && (
                        <a
                          href={`https://x.com/${profile.socialLinks.x}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-transform hover:scale-110 flex items-center justify-center p-2 rounded-full bg-black dark:bg-white"
                        >
                          <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                      )}
                      {profile?.socialLinks?.instagram && (
                        <a
                          href={`https://instagram.com/${profile.socialLinks.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-transform hover:scale-110 flex items-center justify-center p-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-500"
                        >
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                          </svg>
                        </a>
                      )}
                      {profile?.socialLinks?.tiktok && (
                        <a
                          href={`https://tiktok.com/@${profile.socialLinks.tiktok}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-transform hover:scale-110 flex items-center justify-center p-2 rounded-full bg-black dark:bg-white"
                        >
                          <svg className="w-5 h-5 text-white dark:text-black" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.36-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.33 6.33 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="stories">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {currentStories.map(story => (
                    <UserStoryCard
                      key={story.id}
                      id={story.id}
                      title={story.title}
                      imageUrl={story.imageUrl}
                      commentCount={story.commentCount}
                      averageRating={story.averageRating}
                    />
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-8">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
