"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Flame,
  Star,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  Utensils,
  Truck,
  ShieldCheck,
  ChevronRight,
  Search,
  Percent,
  ThumbsUp,
  Store,
  Clock3
} from "lucide-react";
import TopNavbar from "@/components/common/TopNavbar";

export default function HomePage() {
  const categories = [
    { name: "All", icon: "🍽️", active: true },
    { name: "Asian", icon: "🍜", active: false },
    { name: "American", icon: "🍔", active: false },
    { name: "European", icon: "🍕", active: false },
    { name: "Healthy", icon: "🥗", active: false },
    { name: "Dessert", icon: "🍰", active: false },
    { name: "Beverages", icon: "🥤", active: false },
    { name: "Snacks", icon: "🍟", active: false },
  ];

  const popularItems = [
    {
      id: 1,
      name: "American Style Burger",
      canteen: "Western Bites",
      price: 27000,
      oldPrice: 32000,
      rating: 4.8,
      sales: "1.2k+",
      time: "15-20 min",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
      tags: ["Best Seller", "Promo"],
    },
    {
      id: 2,
      name: "Chicken Kebab Skewers",
      canteen: "Middle East Grill",
      price: 25000,
      oldPrice: 28000,
      rating: 4.7,
      sales: "850+",
      time: "20-25 min",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
      tags: ["Halal"],
    },
    {
      id: 3,
      name: "Pasta Tomato Basil",
      canteen: "Italiana",
      price: 32000,
      oldPrice: 35000,
      rating: 4.9,
      sales: "940+",
      time: "10-15 min",
      image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=800",
      tags: ["Vegetarian"],
    },
    {
      id: 4,
      name: "Grilled Herb Lobster",
      canteen: "Seafood Market",
      price: 45000,
      oldPrice: 50000,
      rating: 4.9,
      sales: "300+",
      time: "30-40 min",
      image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800",
      tags: ["Premium"],
    },
    {
      id: 5,
      name: "Curry Yellow Rice",
      canteen: "Indian Spice",
      price: 22000,
      oldPrice: 25000,
      rating: 4.6,
      sales: "1.5k+",
      time: "10-20 min",
      image: "https://images.unsplash.com/photo-1631515243349-e0cb4c1133c9?auto=format&fit=crop&q=80&w=800",
      tags: ["Spicy"],
    },
    {
      id: 6,
      name: "Spicy Roasted Chicken",
      canteen: "Ayam Geprek Mas",
      price: 38000,
      oldPrice: 42000,
      rating: 4.8,
      sales: "2.1k+",
      time: "25-30 min",
      image: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?auto=format&fit=crop&q=80&w=800",
      tags: ["Best Seller", "Spicy"],
    },
    {
      id: 7,
      name: "Matcha Latte Ice",
      canteen: "Campus Cafe",
      price: 18000,
      oldPrice: 20000,
      rating: 4.9,
      sales: "3.5k+",
      time: "5-10 min",
      image: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&q=80&w=800",
      tags: ["Drink", "Refreshing"],
    },
    {
      id: 8,
      name: "Beef Steak Wagyu",
      canteen: "Western Bites",
      price: 85000,
      oldPrice: 95000,
      rating: 5.0,
      sales: "120+",
      time: "35-45 min",
      image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80&w=800",
      tags: ["Premium"],
    },
  ];

  const features = [
    {
      icon: <Utensils className="w-8 h-8 text-white relative z-10" />,
      title: "Wide Variety",
      desc: "Hundreds of meals from different canteens. Asian, Western, Healthy, and more curated just for you.",
      color: "bg-orange-500",
    },
    {
      icon: <Truck className="w-8 h-8 text-white relative z-10" />,
      title: "Fast Campus Delivery",
      desc: "We know where your class is. Get your food delivered straight to your building in under 30 mins.",
      color: "bg-blue-500",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-white relative z-10" />,
      title: "Secure & Fresh",
      desc: "Hygienic packaging and guaranteed warm meals. Safe cashless payments securely integrated.",
      color: "bg-green-500",
    },
  ];

  const popularCanteens = [
    { name: "Central Food Court", rating: 4.8, type: "Mixed Cuisine", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800" },
    { name: "Engineering Cafe", rating: 4.5, type: "Snacks & Coffee", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800" },
    { name: "Health Sci Canteen", rating: 4.9, type: "Healthy Food", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800" },
  ];

  return (
    <div className="flex w-full flex-col font-sans mb-20 animate-in fade-in duration-700 bg-background overflow-x-hidden">

      {/* 1. HERO SECTION */}
      <section className="w-full max-w-360 mx-auto px-4 md:px-6 lg:px-8 pt-8 md:pt-16 pb-12 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Text Content */}
          <div className="flex flex-col gap-6 lg:pr-12 lg:max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary w-fit font-bold text-sm tracking-wide shadow-sm">
              <Flame className="w-4 h-4" />
              <span>Campus #1 Food Delivery</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground leading-[1.1] tracking-tight">
              Craving something <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-orange-400 italic">delicious?</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-lg">
              Get the best meals from your campus canteens delivered straight to your dorm or classroom in minutes. Skip the line, savor your time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/order" className="flex-1 sm:flex-none">
                <Button size="lg" className="w-full sm:w-auto h-14 md:h-16 px-8 rounded-full text-lg font-bold shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 text-white transition-all hover:scale-[1.02]">
                  Order Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/canteens" className="flex-1 sm:flex-none">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 md:h-16 px-8 rounded-full text-lg font-bold border-2 border-border/60 hover:bg-muted/50 hover:border-border transition-all">
                  Browse Canteens
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-6 md:mt-10 pt-6 border-t border-border/50">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-background overflow-hidden relative shadow-sm z-[${10-i}]`}>
                    <img src={`https://i.pravatar.cc/150?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-background bg-muted flex items-center justify-center font-bold text-xs md:text-sm text-muted-foreground relative z-0">
                  +2k
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 md:w-5 md:h-5 fill-current"/>
                  <Star className="w-4 h-4 md:w-5 md:h-5 fill-current"/>
                  <Star className="w-4 h-4 md:w-5 md:h-5 fill-current"/>
                  <Star className="w-4 h-4 md:w-5 md:h-5 fill-current"/>
                  <Star className="w-4 h-4 md:w-5 md:h-5 fill-current"/>
                </div>
                <span className="text-sm font-bold text-foreground mt-1">4.9/5 from 2,000+ reviews</span>
              </div>
            </div>
          </div>
          
          {/* Right: Hero Image */}
          <div className="relative w-full aspect-square md:aspect-4/3 lg:aspect-auto lg:h-[600px] rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl group">
            <img 
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200" 
              alt="Delicious food" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
               <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 md:p-5 flex items-center gap-4 shadow-2xl transform translate-y-4 md:translate-y-8 group-hover:translate-y-0 transition-all duration-500 max-w-sm w-full opacity-0 group-hover:opacity-100">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                     <Truck className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-foreground text-sm md:text-base">Fast Delivery Detected</h4>
                    <p className="text-xs md:text-sm font-medium text-muted-foreground mt-0.5">Your food will arrive in 15-20 mins</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROMO / BANNER SLIDER (Static for now) */}
      <section className="w-full max-w-360 mx-auto px-4 md:px-6 lg:px-8 mb-16 lg:mb-24">
         <div className="bg-primary overflow-hidden rounded-[2rem] relative shadow-xl">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white to-transparent" style={{ backgroundSize: '20px 20px' }}></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 relative z-10">
               <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-sm font-bold w-fit mb-6">
                     <Percent className="w-4 h-4" /> Limited Time Offer
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                     Get 50% Off Your First Order!
                  </h2>
                  <p className="text-white/80 font-medium text-lg mb-8 max-w-md">
                     Use code <strong className="text-white bg-white/20 px-2 py-1 rounded">WELCOME50</strong> at checkout and enjoy delicious meals for half the price.
                  </p>
                  <Button className="w-fit bg-white text-primary hover:bg-white/90 rounded-full font-bold px-8 h-12 text-base shadow-lg">
                     Claim Offer Now
                  </Button>
               </div>
               <div className="hidden md:block relative h-full min-h-[300px]">
                  <img 
                     src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800" 
                     alt="Pizza Promo" 
                     className="absolute inset-0 w-full h-full object-cover clip-path-polygon-[10%_0,100%_0,100%_100%,0_100%]"
                     style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
                  />
               </div>
            </div>
         </div>
      </section>

      {/* 3. CATEGORIES HORIZONTAL SCROLL */}
      <section className="w-full bg-muted/30 py-12 md:py-16 border-y border-border/50">
         <div className="max-w-360 mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                     Explore Menu <Utensils className="w-6 h-6 text-primary" />
                  </h2>
                  <p className="text-muted-foreground font-medium mt-1">Find exactly what you're craving today.</p>
               </div>
            </div>
            
            <div className="flex overflow-x-auto pb-6 gap-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
               {categories.map((cat, idx) => (
               <button
                  key={cat.name}
                  className={`flex flex-col items-center justify-center min-w-[100px] h-28 rounded-2xl transition-all duration-300 border ${
                     cat.active
                     ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                     : "bg-background border-border text-foreground hover:bg-muted/80 hover:border-muted-foreground/30 shadow-sm hover:shadow-md"
                  }`}
               >
                  <span className="text-3xl mb-2">{cat.icon}</span>
                  <span className="text-sm font-bold">{cat.name}</span>
               </button>
               ))}
            </div>
         </div>
      </section>

      {/* 4. POPULAR ITEMS GRID */}
      <section className="w-full max-w-360 mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
               <h2 className="text-3xl md:text-4xl font-extrabold text-foreground flex items-center gap-3">
                  Trending Now <TrendingUp className="w-8 h-8 text-primary" />
               </h2>
               <p className="text-muted-foreground mt-2 font-medium text-lg">The most ordered meals by students this week in campus</p>
            </div>
            <Link href="/order">
               <Button variant="ghost" className="hidden md:flex font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-full h-12 px-6">
                  See All Items <ArrowRight className="ml-2 w-5 h-5"/>
               </Button>
            </Link>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {popularItems.map((item) => (
            <Card key={item.id} className="group cursor-pointer hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border border-border/60 bg-card rounded-3xl overflow-hidden hover:-translate-y-1">
               <div className="relative aspect-4/3 w-full overflow-hidden">
                  <img
                     src={item.image}
                     alt={item.name}
                     className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Badges container */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                     {item.tags.map(tag => (
                        <div key={tag} className={`px-3 py-1 rounded-full text-xs font-bold shadow-md w-fit ${tag === 'Promo' ? 'bg-red-500 text-white' : 'bg-white/95 text-foreground'}`}>
                           {tag}
                        </div>
                     ))}
                  </div>
                  
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-lg text-foreground">
                     <Clock3 className="h-3.5 w-3.5 text-primary" />
                     {item.time}
                  </div>
               </div>
               
               <CardContent className="p-5 md:p-6 flex flex-col gap-1">
                  <div className="flex items-center justify-between w-full mb-1">
                     <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">{item.canteen}</span>
                     <div className="flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md">
                        <Star className="h-3 w-3 fill-current" />
                        {item.rating} ({item.sales})
                     </div>
                  </div>
                  
                  <h3 className="font-extrabold text-[18px] md:text-[20px] text-foreground line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h3>
                  
                  <div className="flex items-end justify-between mt-4">
                     <div className="flex flex-col">
                        {item.oldPrice && (
                           <span className="text-xs font-semibold text-muted-foreground line-through">Rp {(item.oldPrice / 1000)}k</span>
                        )}
                        <span className="text-xl md:text-2xl font-black text-foreground">Rp {(item.price / 1000)}k</span>
                     </div>
                     
                     <Link href="/order" onClick={(e) => e.stopPropagation()}>
                        <Button size="icon" className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 shrink-0">
                           <ShoppingCart className="h-5 w-5" />
                        </Button>
                     </Link>
                  </div>
               </CardContent>
            </Card>
            ))}
         </div>
         
         <div className="mt-10 flex justify-center md:hidden">
            <Link href="/order" className="w-full">
               <Button className="w-full font-bold text-white bg-primary rounded-full h-14">
                  See All Items
               </Button>
            </Link>
         </div>
      </section>

      {/* 5. WHY CHOOSE US / FEATURES */}
      <section className="w-full bg-foreground py-16 md:py-24 text-background">
         <div className="max-w-360 mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">Why InCampus <span className="text-primary">Rocks</span></h2>
               <p className="text-muted font-medium text-lg md:text-xl opacity-80">We made getting food so simple, you literally don't even have to leave your seat or miss a lecture.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
               {features.map((feat, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center group">
                     <div className={`w-20 h-20 md:w-24 md:h-24 rounded-[2rem] ${feat.color} flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden transition-transform duration-500 group-hover:-translate-y-2`}>
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {feat.icon}
                     </div>
                     <h3 className="text-xl md:text-2xl font-extrabold mb-3">{feat.title}</h3>
                     <p className="text-muted font-medium leading-relaxed opacity-80">{feat.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 6. POPULAR CANTEENS */}
      <section className="w-full max-w-360 mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
               <h2 className="text-3xl md:text-4xl font-extrabold text-foreground flex items-center gap-3">
                  Top Canteens <Store className="w-8 h-8 text-primary" />
               </h2>
               <p className="text-muted-foreground mt-2 font-medium text-lg">Your favorite spots, now delivering directly to you.</p>
            </div>
            <Link href="/canteens">
               <Button variant="ghost" className="hidden md:flex font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-full h-12 px-6">
                  View All Places <ArrowRight className="ml-2 w-5 h-5"/>
               </Button>
            </Link>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {popularCanteens.map((canteen, idx) => (
               <Card key={idx} className="group overflow-hidden rounded-[2rem] cursor-pointer border border-border/60 hover:shadow-2xl transition-all duration-500">
                  <div className="relative h-48 sm:h-56 w-full">
                     <img src={canteen.img} alt={canteen.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent"></div>
                     <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="bg-primary/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-current" /> {canteen.rating}
                           </span>
                           <span className="bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-bold">
                              {canteen.type}
                           </span>
                        </div>
                        <h3 className="text-2xl font-extrabold">{canteen.name}</h3>
                     </div>
                  </div>
               </Card>
            ))}
         </div>
      </section>

      {/* 7. BOTTOM CTA */}
      <section className="w-full max-w-360 mx-auto px-4 md:px-6 lg:px-8 mb-12">
         <div className="bg-primary/5 border border-primary/20 rounded-[3rem] p-8 md:p-16 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/0 via-primary to-primary/0"></div>
            
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6 text-primary shadow-inner">
               <Store className="h-10 w-10" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mx-auto mb-6 text-foreground">
               Join 5,000+ students getting food delivered effortlessly.
            </h2>
            <p className="text-muted-foreground font-medium max-w-xl mx-auto text-lg md:text-xl mb-10">
               Discover a wide variety of meals prepared fresh across the campus right now. Seamless ordering, incredibly fast delivery.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Link href="/order">
                  <Button size="lg" className="w-full sm:w-auto rounded-full text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white px-10 h-16 transition-all hover:scale-105">
                     Start Your First Order
                  </Button>
               </Link>
            </div>
         </div>
      </section>

    </div>
  );
}
