"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  Flame,
  Star,
  ArrowRight,
  TrendingUp,
  Utensils,
  Truck,
  ShieldCheck,
  Percent,
  Store,
  Clock3
} from "lucide-react";
import { canteenApi } from "@/lib/api/canteen";
import { categoryApi, Category } from "@/lib/api/category";
import { Canteen } from "@/types/canteen";
import { formatPrice } from "@/lib/utils";

// Map database category names to emojis
const getCategoryEmoji = (name: string): string => {
  const map: Record<string, string> = {
    'Makanan Berat': '🍛',
    'Minuman Dingin': '🥤',
    'Minuman Hangat': '☕',
    'Cemilan Gurih': '🍟',
    'Cemilan Manis': '🍩',
    'Dessert': '🍰',
    'Aneka Jus': '🍹',
    'Kopi': '☕',
    'Teh': '🍵',
    'Soto & Sup': '🥣',
    'Mie': '🍜',
    'Nasi Goreng': '🍛',
    'Bakso & Mie Ayam': '🍜',
    'Gorengan': '🍤',
    'Seafood': '🦞',
    'Roti & Kue': '🍞',
    'Salad Buah': '🥗',
    'Boba & Milk Tea': '🧋',
    'Minuman Tradisional': '🧉',
    'Paket Hemat': '🍱'
  };
  return map[name] || '🍽️';
};

export default function HomePage() {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([canteenApi.list(), categoryApi.list()])
      .then(([canteenData, categoryData]) => {
        setCanteens(canteenData);
        setDbCategories(categoryData);
      })
      .catch((err) => {
        console.error("Failed to fetch homepage data:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Format UI categories list dynamically from DB
  const categoriesList = [
    { name: "All", icon: "🍽️", active: selectedCategory === "All" },
    ...dbCategories.map(cat => ({
      name: cat.name,
      icon: getCategoryEmoji(cat.name),
      active: selectedCategory === cat.name
    }))
  ];

  // Extract all available menu items across all canteens
  const allMenuItems = canteens.flatMap(canteen => 
    (canteen.menu_items || []).map(item => ({
      ...item,
      canteenName: canteen.name,
      canteenId: canteen.id,
      canteenIsOpen: canteen.is_open,
    }))
  ).filter(item => item.is_available && item.canteenIsOpen);

  // Filter menu items by active category
  const filteredItems = selectedCategory === "All"
    ? allMenuItems
    : allMenuItems.filter(item => {
        const itemCatName = item.category_rel?.name || (item as any).category?.name;
        const targetCat = dbCategories.find(c => c.name === selectedCategory);
        return itemCatName === selectedCategory || item.category_id === targetCat?.id;
      });

  // Map first 8 items for the trending section
  const popularItems = filteredItems.slice(0, 8).map(item => {
    // Generate stable visual statistics based on item ID
    const rating = (4.5 + (item.id % 6) * 0.1).toFixed(1);
    const sales = ((item.id % 9 + 1) * 120) + "+";
    const time = (10 + (item.id % 4) * 5) + "-" + (15 + (item.id % 4) * 5) + " min";
    
    // Auto-generate tags based on price/category
    const tags = ["Rekomendasi"];
    if (item.price < 12000) tags.push("Hemat");
    if (item.id % 2 === 0) tags.push("Best Seller");

    return {
      id: item.id,
      name: item.name,
      canteen: item.canteenName,
      price: item.price,
      rating: parseFloat(rating),
      sales: sales,
      time: time,
      image: item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
      tags: tags,
    };
  });

  // Map top 3 canteens
  const popularCanteens = canteens.slice(0, 3).map((canteen) => {
    const rating = (4.5 + (canteen.id % 5) * 0.1).toFixed(1);
    const types = ["Aneka Kuliner", "Makanan Kampus", "Menu Mahasiswa", "Cemilan & Kopi"];
    const type = types[canteen.id % types.length];
    
    return {
      id: canteen.id,
      name: canteen.name,
      rating: parseFloat(rating),
      type: type,
      img: canteen.image_url || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500",
    };
  });

  const features = [
    {
      icon: <Utensils className="w-8 h-8 text-white relative z-10" />,
      title: "Pilihan Beragam",
      desc: "Ratusan hidangan lezat dari berbagai kantin kampus siap memenuhi seleramu hari ini.",
      color: "bg-orange-500",
    },
    {
      icon: <Truck className="w-8 h-8 text-white relative z-10" />,
      title: "Pengantaran Cepat",
      desc: "Kurir kami tahu lokasi kelas atau gedung kuliahmu. Makanan tiba hangat dalam 15-20 menit.",
      color: "bg-blue-500",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-white relative z-10" />,
      title: "Aman & Higienis",
      desc: "Kemasan rapi berstandar sanitasi baik dengan kemudahan pembayaran QRIS/Cashless aman.",
      color: "bg-green-500",
    },
  ];

  return (
    <div className="flex w-full flex-col font-sans mb-20 animate-in fade-in duration-700 bg-background overflow-x-hidden">

      {/* 1. HERO SECTION */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pt-8 md:pt-16 pb-12 lg:pb-24">
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
              Nikmati kelezatan makanan dari kantin kampus favoritmu yang diantar langsung ke kelas, lab, atau asrama dalam hitungan menit.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/customer/order" className="flex-1 sm:flex-none">
                <Button size="lg" className="w-full sm:w-auto h-14 md:h-16 px-8 rounded-full text-lg font-bold shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 text-white transition-all hover:scale-[1.02]">
                  Pesan Sekarang <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/customer/order" className="flex-1 sm:flex-none">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 md:h-16 px-8 rounded-full text-lg font-bold border-2 border-border/60 hover:bg-muted/50 hover:border-border transition-all">
                  Cari Kantin
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-6 md:mt-10 pt-6 border-t border-border/50">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-background overflow-hidden relative shadow-sm z-10`}>
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
                <span className="text-sm font-bold text-foreground mt-1">4.9/5 dari 2,000+ mahasiswa</span>
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
                    <h4 className="font-extrabold text-foreground text-sm md:text-base">Pengantaran Express</h4>
                    <p className="text-xs md:text-sm font-medium text-muted-foreground mt-0.5">Makanan tiba dalam 15-20 menit saja</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROMO / BANNER */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mb-16 lg:mb-24">
         <div className="bg-primary overflow-hidden rounded-[2rem] relative shadow-xl">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white to-transparent" style={{ backgroundSize: '20px 20px' }}></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 relative z-10">
               <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-sm font-bold w-fit mb-6">
                     <Percent className="w-4 h-4" /> Penawaran Terbatas
                  </div>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                     Promo Hemat Setiap Hari!
                  </h2>
                  <p className="text-white/80 font-medium text-lg mb-8 max-w-md">
                     Cari makanan berlabel tag <strong className="text-white bg-white/20 px-2 py-1 rounded">Hemat</strong> dan nikmati kuliner kampus lezat dengan harga bersahabat.
                  </p>
                  <Link href="/customer/order">
                    <Button className="w-fit bg-white text-primary hover:bg-white/90 rounded-full font-bold px-8 h-12 text-base shadow-lg">
                       Pesan Makanan Sekarang
                    </Button>
                  </Link>
               </div>
               <div className="hidden md:block relative h-full min-h-[300px]">
                  <img 
                     src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800" 
                     alt="Pizza Promo" 
                     className="absolute inset-0 w-full h-full object-cover"
                     style={{ clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 0% 100%)' }}
                  />
               </div>
            </div>
         </div>
      </section>

      {/* 3. CATEGORIES HORIZONTAL SCROLL */}
      {/* <section className="w-full bg-muted/30 py-12 md:py-16 border-y border-border/50">
         <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                     Jelajahi Menu <Utensils className="w-6 h-6 text-primary" />
                  </h2>
                  <p className="text-muted-foreground font-medium mt-1">Pilih kategori untuk memfilter makanan lezat di bawah.</p>
               </div>
            </div>
            
            <div className="flex overflow-x-auto pb-6 gap-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
               {isLoading ? (
                  [...Array(8)].map((_, idx) => (
                     <Skeleton key={idx} className="min-w-[100px] h-28 rounded-2xl shrink-0" />
                  ))
               ) : (
                  categoriesList.map((cat) => (
                  <button
                     key={cat.name}
                     onClick={() => setSelectedCategory(cat.name)}
                     className={`flex flex-col items-center justify-center min-w-[100px] h-28 rounded-2xl transition-all duration-300 border ${
                        cat.active
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                        : "bg-background border-border text-foreground hover:bg-muted/80 hover:border-muted-foreground/30 shadow-sm hover:shadow-md"
                     }`}
                  >
                     <span className="text-3xl mb-2">{cat.icon}</span>
                     <span className="text-sm font-bold">{cat.name}</span>
                  </button>
                  ))
               )}
            </div>
         </div>
      </section> */}

      {/* 4. POPULAR ITEMS GRID */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
               <h2 className="text-3xl md:text-4xl font-extrabold text-foreground flex items-center gap-3">
                  Paling Laris <TrendingUp className="w-8 h-8 text-primary" />
               </h2>
               <p className="text-muted-foreground mt-2 font-medium text-lg">Makanan segar dan siap saji dari kantin kampus aktif.</p>
            </div>
            <Link href="/customer/order">
               <Button variant="ghost" className="hidden md:flex font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-full h-12 px-6">
                  Lihat Semua Menu <ArrowRight className="ml-2 w-5 h-5"/>
               </Button>
            </Link>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {isLoading ? (
               [...Array(8)].map((_, idx) => (
                  <Card key={idx} className="border border-border/60 bg-card rounded-3xl overflow-hidden p-5 flex flex-col gap-4">
                     <Skeleton className="aspect-4/3 w-full rounded-2xl" />
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-6 w-3/4" />
                        <div className="flex items-center justify-between pt-2">
                           <Skeleton className="h-8 w-1/2" />
                           <Skeleton className="h-10 w-10 rounded-xl" />
                        </div>
                     </div>
                  </Card>
               ))
            ) : popularItems.length === 0 ? (
               <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-3xl border border-dashed min-h-[300px]">
                  <Utensils className="h-12 w-12 mb-3 text-muted-foreground/40" />
                  <p className="font-bold text-lg">Tidak Ada Makanan Tersedia</p>
                  <p className="text-sm">Silakan pilih kategori lain atau periksa kantin yang sedang buka.</p>
               </div>
            ) : (
               popularItems.map((item) => (
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
                           <div key={tag} className={`px-3 py-1 rounded-full text-xs font-bold shadow-md w-fit ${tag === 'Promo' || tag === 'Best Seller' ? 'bg-red-500 text-white' : 'bg-white/95 text-foreground'}`}>
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
                        <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase truncate max-w-[140px]">{item.canteen}</span>
                        <div className="flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md">
                           <Star className="h-3 w-3 fill-current" />
                           {item.rating} ({item.sales})
                        </div>
                     </div>
                     
                     <h3 className="font-extrabold text-[18px] md:text-[20px] text-foreground line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h3>
                     
                     <div className="flex items-end justify-between mt-4">
                        <div className="flex flex-col">
                           <span className="text-xl md:text-2xl font-black text-foreground">{formatPrice(item.price)}</span>
                        </div>
                        
                        <Link href="/customer/order" onClick={(e) => e.stopPropagation()}>
                           <Button size="icon" className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 shrink-0">
                              <ShoppingCart className="h-5 w-5" />
                           </Button>
                        </Link>
                     </div>
                  </CardContent>
               </Card>
               ))
            )}
         </div>
         
         <div className="mt-10 flex justify-center md:hidden">
            <Link href="/customer/order" className="w-full">
               <Button className="w-full font-bold text-white bg-primary rounded-full h-14">
                  Lihat Semua Menu
               </Button>
            </Link>
         </div>
      </section>

      {/* 5. WHY CHOOSE US / FEATURES
      <section className="w-full bg-foreground py-16 md:py-24 text-background">
         <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6">Mengapa Memilih <span className="text-primary">Daisuke Canteen</span></h2>
               <p className="text-muted font-medium text-lg md:text-xl opacity-80">Layanan pesan antar makanan kampus terbaik yang dirancang khusus untuk kenyamanan aktivitas belajar mengajar Anda.</p>
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
      </section> */}

      {/* 6. POPULAR CANTEENS */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-24">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
               <h2 className="text-3xl md:text-4xl font-extrabold text-foreground flex items-center gap-3">
                  Kantin Terpopuler <Store className="w-8 h-8 text-primary" />
               </h2>
               <p className="text-muted-foreground mt-2 font-medium text-lg">Pesan langsung dari merchant kantin resmi kampus.</p>
            </div>
            <Link href="/customer/order">
               <Button variant="ghost" className="hidden md:flex font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-full h-12 px-6">
                  Lihat Semua Kantin <ArrowRight className="ml-2 w-5 h-5"/>
               </Button>
            </Link>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {isLoading ? (
               [...Array(3)].map((_, idx) => (
                  <Skeleton key={idx} className="h-48 sm:h-56 w-full rounded-[2rem]" />
               ))
            ) : popularCanteens.length === 0 ? (
               <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 rounded-3xl border border-dashed min-h-[200px]">
                  <Store className="h-12 w-12 mb-3 text-muted-foreground/40" />
                  <p className="font-bold text-lg">Belum ada kantin terdaftar</p>
               </div>
            ) : (
               popularCanteens.map((canteen) => (
               <Link href="/customer/order" key={canteen.id}>
                  <Card className="group overflow-hidden rounded-[2rem] cursor-pointer border border-border/60 hover:shadow-2xl transition-all duration-500">
                     <div className="relative h-48 sm:h-56 w-full">
                        <img src={canteen.img} alt={canteen.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
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
               </Link>
               ))
            )}
         </div>
      </section>

      {/* 7. BOTTOM CTA */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mb-12">
         <div className="bg-primary/5 border border-primary/20 rounded-[3rem] p-8 md:p-16 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-primary/0 via-primary to-primary/0"></div>
            
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6 text-primary shadow-inner">
               <Store className="h-10 w-10" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mx-auto mb-6 text-foreground">
               Gabung Bersama Ribuan Mahasiswa Lainnya!
            </h2>
            <p className="text-muted-foreground font-medium max-w-xl mx-auto text-lg md:text-xl mb-10">
               Pesan makanan hangat langsung ke lokasimu tanpa ribet antre. Hemat waktu kuliah dan tugas Anda sekarang.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Link href="/customer/order">
                  <Button size="lg" className="w-full sm:w-auto rounded-full text-lg font-bold shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white px-10 h-16 transition-all hover:scale-105">
                     Mulai Pesanan Pertama Anda
                  </Button>
               </Link>
            </div>
         </div>
      </section>

    </div>
  );
}
