import { SearchSection } from "@/components/SearchSection";
import { GigCard } from "@/components/GigCard";
import { CategorySection } from "@/components/CategorySection";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { RoleSelection } from "@/components/RoleSelection";
import { LogOut } from "lucide-react";
import { DashboardLayout, Goal } from "@/components/DashboardLayout";

const gigs = [
  {
    title: "Food Photography & Review",
    description: "Professional food photography and honest review of your restaurant's signature dishes",
    price: "$299",
    deliveryTime: "3-5 days",
    rating: 4.8,
    engagement: "5.2%",
    followers: "50K",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
    tags: ["Food Photography", "Instagram", "Review"]
  },
  {
    title: "Instagram Story Feature",
    description: "Featured story showcase of your restaurant's ambiance and menu highlights",
    price: "$199",
    deliveryTime: "1-2 days",
    rating: 4.6,
    engagement: "4.8%",
    followers: "35K",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    tags: ["Instagram Stories", "Social Media", "Feature"]
  },
  {
    title: "TikTok Restaurant Highlight",
    description: "Viral-style TikTok video featuring your restaurant's unique aspects",
    price: "$399",
    deliveryTime: "4-6 days",
    rating: 4.9,
    engagement: "6.5%",
    followers: "75K",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9",
    tags: ["TikTok", "Video Content", "Viral"]
  }
];

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>();
  const [filteredGigs, setFilteredGigs] = useState(gigs);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          
          setUserRole(profile?.role || null);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (selectedGoal) {
      const filtered = gigs.filter(gig => 
        gig.tags.some(tag => selectedGoal.services.includes(tag))
      );
      setFilteredGigs(filtered);
    } else {
      setFilteredGigs(gigs);
    }
  }, [selectedGoal]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUserRole(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && !userRole) {
    return <RoleSelection />;
  }

  return (
    <DashboardLayout onGoalSelect={setSelectedGoal} selectedGoal={selectedGoal}>
      {isAuthenticated && (
        <div className="absolute top-4 right-4">
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Taste Tandem</h1>
        <p className="text-lg text-muted-foreground">
          {selectedGoal 
            ? `Discover ${selectedGoal.title.toLowerCase()} solutions tailored for your restaurant.`
            : "Select your business goal from the sidebar to discover curated influencer services that will help you achieve your objectives."}
        </p>
      </div>

      <SearchSection />
      
      <div className="max-w-7xl mx-auto py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          {selectedGoal 
            ? `${selectedGoal.title} Solutions`
            : userRole === "restaurant" 
              ? "Top-Rated Food Influencers" 
              : "Restaurant Opportunities"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGigs.map((gig) => (
            <GigCard key={gig.title} {...gig} />
          ))}
        </div>
        {filteredGigs.length === 0 && (
          <p className="text-center text-muted-foreground mt-8">
            No services found for this goal. Please try another goal or contact us for custom solutions.
          </p>
        )}
      </div>

      <CategorySection />
    </DashboardLayout>
  );
};

export default Index;