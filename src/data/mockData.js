// Comprehensive Mock Data for Kamgar Times News Portal Admin Panel

export const INITIAL_STATS = {
  totalArticles: 1420,
  todayArticles: 18,
  pendingApprovals: 6,
  totalReporters: 24,
  monthlyViews: "1.8M",
  activeBreakingCount: 3,
  epaperSubscribers: "45.2K",
  activeAds: 8,
  activePollVotes: 12840,
  photoAlbumsCount: 14
};

export const INITIAL_BREAKING_NEWS = [
  {
    id: 1,
    title: "मजदूरों के न्यूनतम वेतन में 15% की बढ़ोतरी का श्रम मंत्रालय का बड़ा फैसला, अधिसूचना जारी।",
    category: "Labor News",
    time: "10 mins ago",
    status: "Active",
    priority: "High"
  },
  {
    id: 2,
    title: "कामगार कल्याण बोर्ड: अब ई-श्रम कार्ड धारकों को मिलेगा 5 लाख तक का मुफ्त स्वास्थ्य बीमा।",
    category: "Govt Schemes",
    time: "45 mins ago",
    status: "Active",
    priority: "Medium"
  },
  {
    id: 3,
    title: "कर्मचारी भविष्य निधि (EPFO): पेंशनभोगी 30 नवंबर तक जमा करें डिजिटल जीवन प्रमाण पत्र।",
    category: "State",
    time: "2 hours ago",
    status: "Active",
    priority: "High"
  }
];

export const INITIAL_CATEGORIES = [
  { id: 1, name: "कामगार टाइम्स (Labor)", slug: "labor", count: 420, icon: "HardHat", color: "bg-red-500" },
  { id: 2, name: "लोकल न्यूज़ (Local)", slug: "local", count: 310, icon: "MapPin", color: "bg-amber-500" },
  { id: 3, name: "लेटेस्ट न्यूज़ (Latest)", slug: "latest", count: 285, icon: "Flame", color: "bg-orange-500" },
  { id: 4, name: "गुन्हेवार्ता (Crime)", slug: "crime", count: 180, icon: "ShieldAlert", color: "bg-purple-500" },
  { id: 5, name: "संपादकीय (Editorial)", slug: "editorial", count: 145, icon: "FileText", color: "bg-blue-500" },
  { id: 6, name: "सरकारी नौकरी (Jobs)", slug: "jobs", count: 215, icon: "Briefcase", color: "bg-emerald-500" },
  { id: 7, name: "मनोरंजन (Entertainment)", slug: "entertainment", count: 90, icon: "Film", color: "bg-pink-500" },
  { id: 8, name: "राजनीति (Politics)", slug: "politics", count: 190, icon: "Landmark", color: "bg-indigo-500" },
  { id: 9, name: "क्रीडा (Sports)", slug: "sports", count: 110, icon: "Trophy", color: "bg-teal-500" }
];

export const INITIAL_CITIES = [
  "नागपुर", "मुंबई", "दिल्ली", "लखनऊ", "पटना", "भोपाल", "इंदौर", "जयपुर", "रांची", "रायपुर"
];

export const INITIAL_ARTICLES = [
  {
    id: "labor-wage-hike-2026",
    title: "कामगारों के लिए बड़ी खुशखबरी: न्यूनतम दैनिक मजदूरी में 15% बढ़ोतरी की घोषणा, 1 अक्टूबर से लागू होंगी दरें",
    subheadline: "केंद्रीय श्रम एवं रोजगार मंत्रालय ने असंगठित क्षेत्र और कारखाने में कार्यरत लाखों श्रमिकों को राहत दी।",
    summary: "केंद्र सरकार ने असंगठित क्षेत्र के मजदूरों, निर्माण श्रमिकों और औद्योगिक कर्मचारियों के लिए न्यूनतम वेतन की समीक्षा करते हुए दैनिक मजदूरी दरों में इजाफे का ऐतिहासिक फैसला लिया है।",
    content: "नई दिल्ली: श्रम एवं रोजगार मंत्रालय ने देश के करोड़ों कामगारों और श्रमिकों को बड़ा तोहफा दिया है। 1 अक्टूबर से प्रभावी होने जा रही नई श्रम दरों के तहत अकुशल, अर्ध-कुशल और कुशल कामगारों के न्यूनतम वेतन में औसतन 15% की बढ़ोतरी की गई है।\n\nमंत्रालय द्वारा जारी राजपत्रित अधिसूचना के अनुसार, निर्माण कार्य, खनन, कृषि, स्वच्छता सेवा और औद्योगिक कारखानों में लगे सभी पंजीकृत एवं अपंजीकृत श्रमिकों को इसका प्रत्यक्ष लाभ मिलेगा।",
    category: "labor",
    categoryLabel: "कामगार-मजदूर",
    city: "दिल्ली",
    reporter: "महेंद्र शेंडे (प्रधान संपादक)",
    status: "Published",
    isBreaking: true,
    isFeatured: true,
    isHero: true,
    isTrending: true,
    isLiveBlog: false,
    views: 14520,
    likes: 380,
    date: "26 Sep 2026, 09:30 AM",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "निर्माण स्थल पर कार्यरत भारतीय कामगार। (सांकेतिक चित्र)",
    hasAudio: true,
    audioUrl: "https://example.com/audio/wage-hike.mp3",
    tags: ["LaborWage", "EPFO", "GovtScheme"]
  },
  {
    id: "nagpur-crime-drugs-seized",
    title: "नागपुर पुलिस की गुन्हेवार्ता शाखा द्वारा 50 लाख का अवैध मादक पदार्थ जब्त, 3 आरोपी गिरफ्तार",
    subheadline: "कलमना क्षेत्र में गुप्त सूचना के आधार पर क्राइम ब्रांच की विशेष टीम ने की ताबड़तोड़ छापेमारी।",
    summary: "नागपुर शहर पुलिस आयुक्तालय की गुन्हेवार्ता शाखा ने नशीली दवाओं की अंतरराज्यीय तस्करी गिरोह का पर्दाफाश करते हुए 50 लाख रुपये मूल्य की सामग्री बरामद की है।",
    content: "नागपुर: शहर में नशीले पदार्थों की बिक्री के खिलाफ पुलिस आयुक्त के निर्देश पर चलाई जा रही 'ऑपरेशन क्लीन' मुहिम के तहत गुन्हेवार्ता शाखा को बड़ी सफलता हाथ लगी है।",
    category: "crime",
    categoryLabel: "गुन्हेवार्ता",
    city: "नागपुर",
    reporter: "राकेश पटेल (अपराध प्रतिनिधि)",
    status: "Published",
    isBreaking: true,
    isFeatured: false,
    isHero: false,
    isTrending: true,
    isLiveBlog: false,
    views: 18900,
    likes: 520,
    date: "26 Sep 2026, 08:15 AM",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "क्राइम ब्रांच द्वारा जब्त माल व वाहन।",
    hasAudio: false,
    audioUrl: "",
    tags: ["NagpurCrime", "PoliceUpdate"]
  },
  {
    id: "e-shram-pension-3000",
    title: "ई-श्रम कार्ड धारकों को मिलेगा सीधा बैंक खाते में ₹3,000 पेंशन लाभ: जानिए कैसे करें ऑनलाइन आवेदन",
    subheadline: "श्रम एवं रोजगार मंत्रालय ने असंगठित क्षेत्र के मजदूरों के लिए पेंशन योजना रजिस्ट्रेशन प्रक्रिया सरल बनाई।",
    summary: "60 वर्ष की आयु पूर्ण होने के बाद पंजीकृत श्रमिकों को मानधन योजना के तहत ₹3,000 प्रति माह पेंशन की गारंटी दी जा रही है।",
    content: "नई दिल्ली: ई-श्रम पोर्टल से जुड़े असंगठित क्षेत्र के श्रमिकों के लिए केंद्र सरकार ने नई सामाजिक सुरक्षा गाइडलाइन जारी की है।",
    category: "jobs",
    categoryLabel: "सरकारी योजनाएं",
    city: "मुंबई",
    reporter: "अंजली शर्मा (डिजिटल एडिटर)",
    status: "Published",
    isBreaking: false,
    isFeatured: true,
    isHero: false,
    isTrending: true,
    isLiveBlog: false,
    views: 28400,
    likes: 890,
    date: "26 Sep 2026, 07:15 AM",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "जन सेवा केंद्र पर ई-श्रम कार्ड पंजीकरण।",
    hasAudio: true,
    audioUrl: "https://example.com/audio/eshram.mp3",
    tags: ["EShram", "PensionScheme"]
  },
  {
    id: "maharashtra-cabinet-live-blog",
    title: "महाराष्ट्र कैबिनेट फैसला LIVE: कामगार कल्याण कोष अनुदान 2026 को मिली मंजूरी",
    subheadline: "मंत्रालय में हुई अहम बैठक में श्रमिकों व संविदा कर्मचारियों के हित में लिए गए 5 बड़े फैसले।",
    summary: "मुख्यमंत्री की अध्यक्षता में आयोजित राज्य मंत्रिमंडल की बैठक में निर्माण श्रमिकों को आवास अनुदान की सीमा बढ़ाने का प्रस्ताव मंजूर।",
    content: "मुंबई: राज्य मंत्रिमंडल की बैठक में आज कामगारों के लिए कई घोषणाएं की गई हैं। नीचे समयबद्ध अपडेट्स देखें...",
    category: "local",
    categoryLabel: "राज्य & लोकल",
    city: "मुंबई",
    reporter: "सुरेश वर्मा (वरिष्ठ संपादक)",
    status: "Published",
    isBreaking: true,
    isFeatured: true,
    isHero: false,
    isTrending: true,
    isLiveBlog: true,
    views: 31200,
    likes: 1100,
    date: "26 Sep 2026, 11:00 AM",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&q=80",
    imageCaption: "मंत्रालय भवन, मुंबई।",
    hasAudio: false,
    audioUrl: "",
    tags: ["MaharashtraCabinet", "LiveNews"]
  }
];

export const INITIAL_LIVE_UPDATES = [
  {
    id: 1,
    articleId: "maharashtra-cabinet-live-blog",
    timestamp: "11:30 AM",
    headline: "कामगार कल्याण बोर्ड का वार्षिक बजट ₹500 करोड़ स्वीकृत",
    description: "कैबिनेट ने असंगठित क्षेत्र के कामगारों के बच्चों की उच्च शिक्षा छात्रवृत्ति हेतु बजट दोगुना किया।"
  },
  {
    id: 2,
    articleId: "maharashtra-cabinet-live-blog",
    timestamp: "11:00 AM",
    headline: "मंत्रिमंडल की बैठक शुरू: मुख्यमंत्री और श्रम मंत्री उपस्थित",
    description: "आज की बैठक में 12 महत्वपूर्ण प्रस्तावों पर चर्चा की जा रही है।"
  }
];

export const INITIAL_PHOTO_GALLERIES = [
  {
    id: 1,
    title: "नागपुर औद्योगिक कामगार महारैली एवं पुरस्कार वितरण समारोह 2026",
    category: "कामगार कार्यक्रम",
    date: "25 Sep 2026",
    coverImage: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80",
    photoCount: 12,
    photos: [
      { url: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80", caption: "मुख्य अतिथि का स्वागत।" },
      { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80", caption: "उत्कृष्ट कामगारों को शील्ड वितरण।" }
    ]
  },
  {
    id: 2,
    title: "मुंबई पोर्ट ट्रस्ट यूनियन स्थापना दिवस झंडारोहण",
    category: "यूनियन कार्यक्रम",
    date: "24 Sep 2026",
    coverImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
    photoCount: 8,
    photos: [
      { url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80", caption: "पोर्ट ट्रस्ट कामगारों की उपस्थिति।" }
    ]
  }
];

export const INITIAL_REELS = [
  {
    id: 1,
    title: "श्रम मंत्री का बड़ा ऐलान: असंगठित कामगारों के लिए पेंशन योजना",
    views: "45.8K",
    duration: "0:45",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    title: "रेलवे वर्कशॉप हड़ताल वापस: जानिए 12 मुख्य मांगें",
    views: "28.4K",
    duration: "0:58",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80"
  }
];

export const INITIAL_EPAPERS = [
  {
    id: 1,
    editionDate: "26 Sep 2026",
    city: "नागपुर एवं विदर्भ मुख्य संस्करण",
    totalPages: 12,
    pdfSize: "14.2 MB",
    pdfUrl: "https://example.com/epaper/nagpur-26sep2026.pdf",
    downloads: 3840,
    status: "Published",
    thumbnail: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    editionDate: "26 Sep 2026",
    city: "मुंबई एवं ठाणे संस्करण",
    totalPages: 10,
    pdfSize: "11.8 MB",
    pdfUrl: "https://example.com/epaper/mumbai-26sep2026.pdf",
    downloads: 2190,
    status: "Published",
    thumbnail: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=400&q=80"
  }
];

export const INITIAL_POLL = {
  id: 1,
  question: "क्या न्यूनतम वेतन में 15% की बढ़ोतरी वर्तमान महंगाई को देखते हुए पर्याप्त है?",
  options: [
    { id: 'opt1', text: "हाँ, यह कामगारों के लिए राहत भरा कदम है", votes: 8420 },
    { id: 'opt2', text: "नहीं, महंगाई दर के हिसाब से 25% वृद्धि होनी चाहिए", votes: 3910 },
    { id: 'opt3', text: "कह नहीं सकते", votes: 510 }
  ],
  totalVotes: 12840,
  status: "Active"
};

export const INITIAL_HOROSCOPE = [
  { sign: "मेष (Aries)", text: "आज कामगारों के लंबित कार्य पूर्ण होंगे। कार्यस्थल पर सहकर्मियों का सहयोग मिलेगा। शुभ अंक: 9।" },
  { sign: "वृषभ (Taurus)", text: "व्यापार व वेतन वृद्धि के योग हैं। नए प्रोजेक्ट्स में सफलता मिलेगी। शुभ अंक: 6।" },
  { sign: "मिथुन (Gemini)", text: "आर्थिक सुधार होगा। कानूनी मामलों में स्थिति आपके पक्ष में होगी। शुभ अंक: 5।" },
  { sign: "कर्क (Cancer)", text: "मानसिक शांति बनी रहेगी। पारिवारिक एवं स्वास्थ्य सुरक्षा पर ध्यान दें। शुभ अंक: 2।" }
];

export const INITIAL_REPORTERS = [
  {
    id: 1,
    name: "महेंद्र शेंडे",
    email: "mahendra.s@kamgartimes.com",
    role: "प्रधान संपादक & संस्थापक",
    location: "नागपुर",
    phone: "+91 98200 12345",
    articlesCount: 450,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 2,
    name: "अंजली शर्मा",
    email: "anjali.s@kamgartimes.com",
    role: "Senior Digital Editor",
    location: "मुंबई",
    phone: "+91 98111 67890",
    articlesCount: 320,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: 3,
    name: "राकेश पटेल",
    email: "rakesh.p@kamgartimes.com",
    role: "Field Reporter (Crime & Union)",
    location: "नागपुर",
    phone: "+91 97300 45678",
    articlesCount: 185,
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  }
];

export const INITIAL_ADS = [
  {
    id: 1,
    title: "ई-श्रम कार्ड मुफ्त पंजीकरण अभियान",
    client: "श्रम कल्याण मंडल",
    position: "Header Banner (728x90)",
    targetUrl: "https://eshram.gov.in",
    clicks: 12450,
    impressions: 145000,
    expiryDate: "30 Oct 2026",
    status: "Active"
  },
  {
    id: 2,
    title: "कामगार पेंशन योजना विशेष विज्ञापन",
    client: "LIC / श्रम सुरक्षा बोर्ड",
    position: "Sidebar Sticky Ad (300x250)",
    targetUrl: "https://licindia.in",
    clicks: 8900,
    impressions: 98000,
    expiryDate: "15 Nov 2026",
    status: "Active"
  }
];

export const INITIAL_COMMENTS = [
  {
    id: 1,
    articleTitle: "न्यूनतम वेतन अधिनियम 2026: कामगारों के दैनिक भत्ते में 15% बढ़ोतरी",
    author: "महेश जाधव (कपड़ा मजदूर)",
    comment: "बहुत ही सराहनीय निर्णय है! क्या यह नियम प्राइवेट सिक्योरिटी गार्ड्स पर भी लागू होगा?",
    date: "15 mins ago",
    status: "Approved"
  },
  {
    id: 2,
    articleTitle: "ई-श्रम कार्ड धारकों को मिलेगा सीधा बैंक खाते में ₹3,000 पेंशन",
    author: "राजेश सिंह (निर्माण श्रमिक)",
    comment: "मैंने पिछले महीने आवेदन किया था लेकिन अभी तक स्टेटस पेंडिंग दिखा रहा है।",
    date: "1 hour ago",
    status: "Pending"
  }
];

export const INITIAL_SETTINGS = {
  siteName: "कामगार टाइम्स (Kamgar Times)",
  tagline: "जनसामान्यांचा बुलंद आवाज...",
  chiefEditor: "महेंद्र शेंडे",
  primaryLanguage: "Hindi (हिंदी)",
  contactEmail: "admin@kamgartimes.com",
  whatsappGroup: "https://chat.whatsapp.com/KamgarTimesHindiNews",
  youtubeChannel: "https://youtube.com/@KamgarTimesOfficial",
  facebookPage: "https://facebook.com/KamgarTimesHindi",
  breakingNewsScrollSpeed: 15,
  autoApproveComments: false,
  maintenanceMode: false,
  apiBackendUrl: "http://localhost:5000/api/v1"
};
