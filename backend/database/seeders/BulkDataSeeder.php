<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Canteen;
use App\Models\Category;
use App\Models\DeliveryPoint;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Notification;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class BulkDataSeeder extends Seeder
{
    protected static ?string $hashedPassword = null;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Truncate tables to ensure a clean state and avoid duplicate key constraints
        DB::statement('TRUNCATE TABLE users, canteens, categories, delivery_points, menu_items, orders, order_items, payments, notifications CASCADE;');

        // Reuse static password hashing to optimize performance
        $passwordHash = self::$hashedPassword ??= Hash::make('password');

        // 2. Seed Admin Users (3 admins)
        $admins = [
            [
                'name' => 'Admin Utama',
                'email' => 'admin@campus.ac.id',
                'password_hash' => $passwordHash,
                'role' => 'admin',
                'phone' => '081111111101',
                'is_active' => true,
            ],
            [
                'name' => 'Admin Support 1',
                'email' => 'admin2@campus.ac.id',
                'password_hash' => $passwordHash,
                'role' => 'admin',
                'phone' => '081111111102',
                'is_active' => true,
            ],
            [
                'name' => 'Admin Support 2',
                'email' => 'admin3@campus.ac.id',
                'password_hash' => $passwordHash,
                'role' => 'admin',
                'phone' => '081111111103',
                'is_active' => true,
            ],
        ];

        foreach ($admins as $adminData) {
            User::create($adminData);
        }

        // 3. Seed Categories (20 categories)
        $categoriesList = [
            'Makanan Berat', 'Minuman Dingin', 'Minuman Hangat', 'Cemilan Gurih', 'Cemilan Manis',
            'Dessert', 'Aneka Jus', 'Kopi', 'Teh', 'Soto & Sup',
            'Mie', 'Nasi Goreng', 'Bakso & Mie Ayam', 'Gorengan', 'Seafood',
            'Roti & Kue', 'Salad Buah', 'Boba & Milk Tea', 'Minuman Tradisional', 'Paket Hemat'
        ];

        $categories = [];
        foreach ($categoriesList as $catName) {
            $categories[] = Category::create(['name' => $catName]);
        }

        // 4. Seed Canteen Owners & Canteens (20 canteens)
        $canteenOwnersInfo = [
            ['name' => 'Kantin FMIPA', 'email' => 'kantinfmipa@gmail.com', 'canteen_name' => 'Kantin FMIPA Gedung B', 'desc' => 'Menyediakan makanan sehat dan higienis untuk civitas FMIPA.', 'loc' => 'FMIPA Gedung B Lantai 1'],
            ['name' => 'Kantin Alif', 'email' => 'kantinalif@gmail.com', 'canteen_name' => 'Kantin Alif', 'desc' => 'Spesialis penyetan, mie ayam, bakso, dan hidangan nusantara lezat.', 'loc' => 'Samping Masjid Kampus'],
            ['name' => 'Test Kantin Owner', 'email' => 'kantintest@campus.ac.id', 'canteen_name' => 'Kantin Test', 'desc' => 'Kantin percobaan untuk sistem food delivery.', 'loc' => 'Gedung Rektorat Lt. Basement'],
            ['name' => 'Kantin Teknik Elektro', 'email' => 'kantinteknik@campus.ac.id', 'canteen_name' => 'Kantin Teknik Elektro', 'desc' => 'Hidangan cepat saji dan kopi peningkat fokus mahasiswa teknik.', 'loc' => 'Gedung Elektro Lt. 1'],
            ['name' => 'Kantin FIB Selasar', 'email' => 'kantinfib@campus.ac.id', 'canteen_name' => 'Kantin FIB Selasar', 'desc' => 'Tempat berkumpul yang estetik dengan kopi dan cemilan tradisional.', 'loc' => 'Selasar FIB Depan Teater'],
            ['name' => 'Kantin FEB Utama', 'email' => 'kantinfeb@campus.ac.id', 'canteen_name' => 'Kantin FEB Utama', 'desc' => 'Nasi rames, juice segar, dan salad sehat untuk energi belajar Anda.', 'loc' => 'Kantin Plaza FEB'],
            ['name' => 'Kantin Fasilkom', 'email' => 'kantinfasilkom@campus.ac.id', 'canteen_name' => 'Kantin Fasilkom', 'desc' => 'Kantin dengan koneksi wifi kencang, mi instan special, dan kopi susu.', 'loc' => 'Gedung IT Center Fasilkom'],
            ['name' => 'Kantin FK Kedokteran', 'email' => 'kantinfk@campus.ac.id', 'canteen_name' => 'Kantin FK Kedokteran', 'desc' => 'Menu rendah kalori, jus buah murni, dan makanan sehat bersertifikat.', 'loc' => 'Gedung C FK Lantai Dasar'],
            ['name' => 'Kantin FISIP', 'email' => 'kantinfisip@campus.ac.id', 'canteen_name' => 'Kantin FISIP', 'desc' => 'Aneka makanan berat tradisional, soto mie, dan es buah segar.', 'loc' => 'Taman FISIP Belakang Dekanat'],
            ['name' => 'Kantin FH Hukum', 'email' => 'kantinfh@campus.ac.id', 'canteen_name' => 'Kantin FH Hukum', 'desc' => 'Gado-gado, ketoprak, dan nasi uduk legendaris kampus hukum.', 'loc' => 'Gedung A FH Basement'],
            ['name' => 'Kantin Farmasi', 'email' => 'kantinfarmasi@campus.ac.id', 'canteen_name' => 'Kantin Farmasi', 'desc' => 'Snack sehat, roti bakar premium, dan aneka minuman herbal.', 'loc' => 'Samping Laboratorium Farmasi'],
            ['name' => 'Kantin FKM Kesehatan', 'email' => 'kantinfkm@campus.ac.id', 'canteen_name' => 'Kantin FKM Kesehatan', 'desc' => 'Menyediakan bubur ayam sehat, salad sayur, dan oatmeal praktis.', 'loc' => 'Gedung Pusat FKM'],
            ['name' => 'Kantin MIPA Kimia', 'email' => 'kantinkimia@campus.ac.id', 'canteen_name' => 'Kantin MIPA Kimia', 'desc' => 'Kopi racikan kimiawan amatir, donat, dan kue basah tradisional.', 'loc' => 'Lab Kimia Baru Lantai 1'],
            ['name' => 'Kantin Vokasi', 'email' => 'kantinvokasi@campus.ac.id', 'canteen_name' => 'Kantin Vokasi', 'desc' => 'Nasi Padang mini, batagor renyah, dan thai tea manis segar.', 'loc' => 'Gedung Vokasi Sayap Timur'],
            ['name' => 'Kantin Asrama', 'email' => 'kantinasrama@campus.ac.id', 'canteen_name' => 'Kantin Asrama', 'desc' => 'Warung makan serba ada 24 jam dengan paket mahasiswa hemat.', 'loc' => 'Asrama Mahasiswa Gedung A'],
            ['name' => 'Kantin Pusat Pusgiwa', 'email' => 'kantinpusat@campus.ac.id', 'canteen_name' => 'Kantin Pusat (Pusgiwa)', 'desc' => 'Pusat kuliner kampus terlengkap dengan puluhan menu andalan.', 'loc' => 'Gedung Kegiatan Mahasiswa Lt. 1'],
            ['name' => 'Kantin Rektorat', 'email' => 'kantinrektorat@campus.ac.id', 'canteen_name' => 'Kantin Rektorat', 'desc' => 'Menyajikan hidangan premium, ayam bakar, sate madura, dan kopi arabika.', 'loc' => 'Gedung Rektorat Utama Lt. 2'],
            ['name' => 'Kantin Kopma', 'email' => 'kantinkopma@campus.ac.id', 'canteen_name' => 'Kantin Kopma', 'desc' => 'Snack curah, es krim scoop, roti isi, dan kopi instan siap saji.', 'loc' => 'Koperasi Mahasiswa Utama'],
            ['name' => 'Kantin Perpustakaan', 'email' => 'kantinperpus@campus.ac.id', 'canteen_name' => 'Kantin Perpustakaan', 'desc' => 'Suasana tenang dengan teh hangat, croissant lembut, dan buah segar.', 'loc' => 'Taman Baca Lt. Semi-Outdoor'],
            ['name' => 'Kantin Masjid Kampus', 'email' => 'kantinmasjid@campus.ac.id', 'canteen_name' => 'Kantin Masjid Kampus', 'desc' => 'Susu kurma, air mineral, kebab turki halal, dan kurma manis.', 'loc' => 'Pelataran Parkir Masjid Kampus'],
        ];

        $canteens = [];
        $canteenImageUrls = [
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500', // Restaurant
            'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500', // Fine dining
            'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=500', // Diner
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500', // Cafe
            'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500', // Aesthetic
        ];
        
        $qrisDemoUrl = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg';

        foreach ($canteenOwnersInfo as $index => $ownerInfo) {
            $canteenUser = User::create([
                'name' => $ownerInfo['name'],
                'email' => $ownerInfo['email'],
                'password_hash' => $passwordHash,
                'role' => 'canteen',
                'phone' => '0812' . rand(10000000, 99999999),
                'is_active' => true,
            ]);

            $canteenImg = $canteenImageUrls[$index % count($canteenImageUrls)];

            $canteens[] = Canteen::create([
                'user_id' => $canteenUser->id,
                'name' => $ownerInfo['canteen_name'],
                'description' => $ownerInfo['desc'],
                'location' => $ownerInfo['loc'],
                'is_open' => true,
                'image_url' => $canteenImg,
                'qris_image_url' => $qrisDemoUrl,
            ]);
        }

        // 5. Seed Customer Users (25 customers)
        $customersList = [
            ['name' => 'Ihsan Restu Adi', 'email' => 'iihsannlearn@gmail.com'],
            ['name' => 'Budi Santoso', 'email' => 'budi@campus.ac.id'],
            ['name' => 'Siti Aminah', 'email' => 'siti@campus.ac.id'],
            ['name' => 'Rian Hidayat', 'email' => 'rian@campus.ac.id'],
            ['name' => 'Dewi Lestari', 'email' => 'dewi@campus.ac.id'],
            ['name' => 'Andi Wijaya', 'email' => 'andi@campus.ac.id'],
            ['name' => 'Mega Utami', 'email' => 'mega@campus.ac.id'],
            ['name' => 'Fajar Nugraha', 'email' => 'fajar@campus.ac.id'],
            ['name' => 'Putri Indah', 'email' => 'putri@campus.ac.id'],
            ['name' => 'Rudi Hermawan', 'email' => 'rudi@campus.ac.id'],
            ['name' => 'Eka Saputra', 'email' => 'eka@campus.ac.id'],
            ['name' => 'Ayu Wandira', 'email' => 'ayu@campus.ac.id'],
            ['name' => 'Dedi Kurniawan', 'email' => 'dedi@campus.ac.id'],
            ['name' => 'Novi Anggraini', 'email' => 'novi@campus.ac.id'],
            ['name' => 'Hendra Wijaya', 'email' => 'hendra@campus.ac.id'],
            ['name' => 'Rina Pratama', 'email' => 'rina@campus.ac.id'],
            ['name' => 'Yusuf Habibi', 'email' => 'yusuf@campus.ac.id'],
            ['name' => 'Sarah Wijayanti', 'email' => 'sarah@campus.ac.id'],
            ['name' => 'Rizal Fahmi', 'email' => 'rizal@campus.ac.id'],
            ['name' => 'Tias Anggraeni', 'email' => 'tias@campus.ac.id'],
            ['name' => 'Tommy Setiawan', 'email' => 'tommy@campus.ac.id'],
            ['name' => 'Joko Susilo', 'email' => 'joko@campus.ac.id'],
            ['name' => 'Maria Kristina', 'email' => 'maria@campus.ac.id'],
            ['name' => 'David Christian', 'email' => 'david@campus.ac.id'],
            ['name' => 'Anita Rahmawati', 'email' => 'anita@campus.ac.id'],
        ];

        $customers = [];
        foreach ($customersList as $custInfo) {
            $customers[] = User::create([
                'name' => $custInfo['name'],
                'email' => $custInfo['email'],
                'password_hash' => $passwordHash,
                'role' => 'customer',
                'phone' => '0857' . rand(10000000, 99999999),
                'is_active' => true,
            ]);
        }

        // 6. Seed Delivery Points (At least 20 in total; 2 per customer = 50 delivery points)
        $deliveryAddresses = [
            ['name' => 'Lobi Utama', 'address' => 'Gedung A Dekanat Lantai 1'],
            ['name' => 'Gazebo Belakang', 'address' => 'Taman Depan Lab Fisika'],
            ['name' => 'Ruang Baca', 'address' => 'Perpustakaan Pusat Lantai 2'],
            ['name' => 'Selasar Kelas', 'address' => 'Gedung B Ruang B.205'],
            ['name' => 'Pos Satpam', 'address' => 'Gerbang Masuk Utama Utara'],
            ['name' => 'Ruang Himpunan', 'address' => 'Gedung Student Center Lt. 3'],
            ['name' => 'Masjid Kampus', 'address' => 'Serambi Belakang Tempat Wudhu Pria'],
            ['name' => 'Asrama Putra', 'address' => 'Lobi Utama Gedung A'],
            ['name' => 'Asrama Putri', 'address' => 'Pos Penjagaan Depan Gedung B'],
            ['name' => 'Laboratorium Komputer', 'address' => 'Fasilkom Gedung C Lt. 2'],
            ['name' => 'Auditorium Utama', 'address' => 'Rektorat Lantai 3'],
            ['name' => 'Klinik Kampus', 'address' => 'Ruang Tunggu Pasien'],
            ['name' => 'Gedung D Dekanat', 'address' => 'Selasar Depan Lift Lantai 2'],
            ['name' => 'Sport Center', 'address' => 'Tribun Barat Lapangan Basket'],
            ['name' => 'Amfiteater MIPA', 'address' => 'Tangga Tengah Lantai 1'],
            ['name' => 'Gedung Laboratorium Terpadu', 'address' => 'Ruang Instrumentasi Lt. 1'],
            ['name' => 'Kantor Administrasi', 'address' => 'Gedung FEB Lantai Dasar'],
            ['name' => 'Lobby Bioskop', 'address' => 'Gedung Teater FIB'],
            ['name' => 'Taman Rindang', 'address' => 'Samping Kolam Rektorat'],
            ['name' => 'Ruang Dosen MIPA', 'address' => 'Gedung A Ruang A.312'],
        ];

        $deliveryPointsGrouped = []; // user_id => [DeliveryPoints]
        foreach ($customers as $customer) {
            $pointsForUser = [];
            // Assign 2 random unique address templates
            $templates = array_rand($deliveryAddresses, 2);
            foreach ($templates as $tmplIndex) {
                $addr = $deliveryAddresses[$tmplIndex];
                $pointsForUser[] = DeliveryPoint::create([
                    'user_id' => $customer->id,
                    'name' => $addr['name'],
                    'address' => $addr['address'],
                ]);
            }
            $deliveryPointsGrouped[$customer->id] = $pointsForUser;
        }

        // 7. Seed Menu Items for each canteen
        // We define a list of common foods/drinks/snacks/desserts with realistic categories
        $menuTemplates = [
            [
                'name' => 'Nasi Goreng Ayam',
                'desc' => 'Nasi goreng gurih dengan suwiran ayam, telur dadar iris, acar, dan kerupuk.',
                'price' => 15000.00,
                'image' => 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500',
                'category_name' => 'Nasi Goreng',
            ],
            [
                'name' => 'Ayam Geprek Sambal Korek',
                'desc' => 'Ayam goreng tepung renyah digeprek dengan sambal bawang pedas nampol.',
                'price' => 16000.00,
                'image' => 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500',
                'category_name' => 'Makanan Berat',
            ],
            [
                'name' => 'Mie Ayam Pangsit Rebus',
                'desc' => 'Mie kuning dengan topping ayam manis gurih, sawi, pangsit rebus lembut, dan kuah kaldu.',
                'price' => 14000.00,
                'image' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
                'category_name' => 'Bakso & Mie Ayam',
            ],
            [
                'name' => 'Bakso Sapi Urat Pedas',
                'desc' => 'Bakso sapi urat besar dengan tetelan, tahu bakso, sayuran, bihun, dan kuah gurih.',
                'price' => 15000.00,
                'image' => 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=500',
                'category_name' => 'Bakso & Mie Ayam',
            ],
            [
                'name' => 'Es Kopi Susu Aren',
                'desc' => 'Espresso house blend dicampur susu segar premium dan gula aren manis legit.',
                'price' => 12000.00,
                'image' => 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500',
                'category_name' => 'Kopi',
            ],
            [
                'name' => 'Matcha Latte Ice',
                'desc' => 'Bubuk matcha jepang pilihan dengan fresh milk manis dingin.',
                'price' => 10000.00,
                'image' => 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=500',
                'category_name' => 'Minuman Dingin',
            ],
            [
                'name' => 'Es Teh Manis Jumbo',
                'desc' => 'Teh melati seduh tradisional disajikan manis dengan es batu melimpah.',
                'price' => 3000.00,
                'image' => 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500',
                'category_name' => 'Teh',
            ],
            [
                'name' => 'Lemon Tea Fresh',
                'desc' => 'Teh seduh segar dipadukan dengan irisan jeruk lemon asli.',
                'price' => 5000.00,
                'image' => 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500',
                'category_name' => 'Teh',
            ],
            [
                'name' => 'Batagor Kuah Kacang',
                'desc' => 'Baso tahu goreng Bandung renyah dipotong kecil disiram saus kacang gurih pedas.',
                'price' => 12000.00,
                'image' => 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500',
                'category_name' => 'Cemilan Gurih',
            ],
            [
                'name' => 'Kentang Goreng Cheese',
                'desc' => 'Kentang goreng renyah ditaburi bumbu keju lumer manis gurih.',
                'price' => 10000.00,
                'image' => 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500',
                'category_name' => 'Cemilan Gurih',
            ],
            [
                'name' => 'Roti Bakar Keju Cokelat',
                'desc' => 'Roti panggang dengan isian mesis cokelat premium dan taburan keju cheddar parut.',
                'price' => 10000.00,
                'image' => 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?w=500',
                'category_name' => 'Cemilan Manis',
            ],
            [
                'name' => 'Salad Buah Keju Segar',
                'desc' => 'Potongan buah melon, semangka, apel, anggur disiram mayo manis, susu, dan keju.',
                'price' => 12000.00,
                'image' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
                'category_name' => 'Salad Buah',
            ],
        ];

        // Find Category ID by name utility
        $categoryMap = [];
        foreach ($categories as $cat) {
            $categoryMap[$cat->name] = $cat->id;
        }

        $canteenMenuItems = []; // canteen_id => [MenuItems]
        foreach ($canteens as $canteen) {
            $canteenMenuItems[$canteen->id] = [];
            // Slice/Select a subset of menu items for this canteen (each canteen gets 5 to 6 menu items)
            $selectedTemplates = array_rand($menuTemplates, rand(5, 7));
            foreach ($selectedTemplates as $tmplIdx) {
                $tmpl = $menuTemplates[$tmplIdx];
                
                // Get corresponding category ID or default to 'Makanan Berat'
                $catName = $tmpl['category_name'];
                $catId = $categoryMap[$catName] ?? $categoryMap['Makanan Berat'];

                $canteenMenuItems[$canteen->id][] = MenuItem::create([
                    'canteen_id' => $canteen->id,
                    'category_id' => $catId,
                    'name' => $tmpl['name'] . ' ' . $canteen->name, // make name somewhat unique
                    'description' => $tmpl['desc'],
                    'price' => $tmpl['price'] + rand(-2000, 3000), // add price variation
                    'image_url' => $tmpl['image'],
                    'is_available' => true,
                ]);
            }
        }

        // 8. Seed Orders, OrderItems, and Payments (At least 20; we seed 60 orders)
        $orderStatuses = ['delivered', 'preparing', 'confirmed', 'pending', 'waiting_for_payment', 'cancelled'];
        
        for ($i = 1; $i <= 60; $i++) {
            // Pick a random customer
            $customer = $customers[array_rand($customers)];
            $customerPoints = $deliveryPointsGrouped[$customer->id];
            $deliveryPoint = $customerPoints[array_rand($customerPoints)];

            // Pick a random canteen
            $canteen = $canteens[array_rand($canteens)];
            $menuItems = $canteenMenuItems[$canteen->id];

            // Pick a status based on probabilities
            $randVal = rand(1, 100);
            if ($randVal <= 50) {
                $status = 'delivered'; // 50% delivered
            } elseif ($randVal <= 70) {
                $status = 'preparing'; // 20% active (preparing)
            } elseif ($randVal <= 80) {
                $status = 'pending'; // 10% waiting verification
            } elseif ($randVal <= 90) {
                $status = 'waiting_for_payment'; // 10% waiting payment
            } else {
                $status = 'cancelled'; // 10% cancelled
            }

            // Create order with ordered_at in the last 14 days
            $daysAgo = rand(0, 14);
            $orderTime = Carbon::now()->subDays($daysAgo)->subHours(rand(1, 23))->subMinutes(rand(1, 59));
            $deliveryTime = $status === 'delivered' ? (clone $orderTime)->addMinutes(rand(15, 50)) : null;

            $order = Order::create([
                'user_id' => $customer->id,
                'canteen_id' => $canteen->id,
                'delivery_point_id' => $deliveryPoint->id,
                'status' => $status,
                'total_price' => 0.00, // will calculate below
                'notes' => rand(0, 10) > 7 ? 'Tolong disegerakan, terima kasih!' : null,
                'ordered_at' => $orderTime,
                'delivered_at' => $deliveryTime,
            ]);

            // Add 1 to 3 items
            $numItems = rand(1, 3);
            $itemsKeys = array_rand($menuItems, min($numItems, count($menuItems)));
            if (!is_array($itemsKeys)) {
                $itemsKeys = [$itemsKeys];
            }

            $orderTotal = 0;
            foreach ($itemsKeys as $key) {
                $menuItem = $menuItems[$key];
                $qty = rand(1, 3);
                $subtotal = $menuItem->price * $qty;
                $orderTotal += $subtotal;

                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $qty,
                    'subtotal' => $subtotal,
                    'notes' => rand(0, 10) > 8 ? 'Kurangi pedas' : null,
                ]);
            }

            // Update order's total price
            $order->update(['total_price' => $orderTotal]);

            // Create corresponding payment
            // Methods: cod, midtrans, qris
            $payMethod = ['cod', 'midtrans', 'qris'][rand(0, 2)];
            
            // Payment status matching order status
            if ($status === 'delivered' || $status === 'preparing' || $status === 'confirmed') {
                $payStatus = 'paid';
                $paidAt = (clone $orderTime)->addMinutes(rand(1, 10));
            } elseif ($status === 'pending') {
                // waiting_verification in canteen app is used when proof of payment is uploaded
                $payStatus = 'waiting_verification';
                $paidAt = null;
            } elseif ($status === 'waiting_for_payment') {
                $payStatus = 'pending';
                $paidAt = null;
            } else {
                // cancelled order
                $payStatus = rand(0, 1) ? 'failed' : 'expired';
                $paidAt = null;
            }

            $proofImg = ($payStatus === 'paid' || $payStatus === 'waiting_verification') ? $qrisDemoUrl : null;

            Payment::create([
                'order_id' => $order->id,
                'method' => $payMethod,
                'status' => $payStatus,
                'amount' => $orderTotal,
                'proof_image_url' => $proofImg,
                'snap_token' => $payMethod === 'midtrans' ? 'snap_token_' . uniqid() : null,
                'payment_url' => $payMethod === 'midtrans' ? 'https://app.sandbox.midtrans.com/snap/v2/vtweb/' . uniqid() : null,
                'midtrans_order_id' => $payMethod === 'midtrans' ? 'midtrans_' . uniqid() : null,
                'expired_at' => $payStatus === 'pending' ? (clone $orderTime)->addHour() : null,
                'paid_at' => $paidAt,
            ]);

            // 9. Seed notifications for this order (At least 20 in total)
            if ($i <= 40) {
                // User notification
                Notification::create([
                    'user_id' => $customer->id,
                    'order_id' => $order->id,
                    'message' => 'Pesanan #' . $order->id . ' Anda berstatus: ' . $status,
                    'is_read' => rand(0, 1) === 1,
                ]);

                // Owner notification
                $canteenOwner = User::where('id', $canteen->user_id)->first();
                if ($canteenOwner) {
                    Notification::create([
                        'user_id' => $canteenOwner->id,
                        'order_id' => $order->id,
                        'message' => 'Pesanan baru #' . $order->id . ' masuk ke kantin Anda.',
                        'is_read' => rand(0, 1) === 1,
                    ]);
                }
            }
        }
    }
}
