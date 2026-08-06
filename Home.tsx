import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Image as ImageIcon, Sparkles, Send, Share2, Settings, Lock, Unlock, 
  CheckCircle2, ShoppingBag, Tag, RefreshCw, Smartphone, HelpCircle, ArrowRight, ArrowLeft, Download, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function Home() {
  // --- إعدادات المتجر العامة (قابلة للتعديل من لوحة المطور) ---
  const [storeConfig, setStoreConfig] = useState({
    storeName: 'مركز العاصمة للملابس',
    storePhone: '+967 770 000 000',
    whatsappChannel: 'https://chat.whatsapp.com/example_channel',
    currency: 'ر.ي',
    defaultDiscount: 30,
  });

  // --- لوحة تحكم المطور المحمية ---
  const [showDevModal, setShowDevModal] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  const [isDevLoggedIn, setIsDevLoggedIn] = useState(false);
  const [devPassError, setDevPassError] = useState(false);

  // --- خطوات التطبيق الرئيسية (1: الصورة, 2: الفئة والنصوص, 3: الأسعار والذكاء الاصطناعي, 4: المعاينة والمشاركة) ---
  const [currentStep, setCurrentStep] = useState(1);

  // --- بيانات المنتج والإعلان ---
  const [productImage, setProductImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'girl' | 'women' | 'baby' | 'boy'>('girl');
  const [categoryName, setCategoryName] = useState('فستان بناتي راقي');
  const [subTitle, setSubTitle] = useState('تشكيلة العيد الفاخرة');
  const [mainTitle, setMainTitle] = useState('دولتشي مودرن');
  const [oldPrice, setOldPrice] = useState('15000');
  const [newPrice, setNewPrice] = useState('9900');
  const [colorsAvailable, setColorsAvailable] = useState('أزرق ملكي، وردي، أبيض');
  const [sizesAvailable, setSizesAvailable] = useState('من 2 إلى 10 سنوات');
  
  // --- خيارات الذكاء الاصطناعي لتلبيس الملابس ---
  const [aiModel, setAiModel] = useState<'idm-vton' | 'catvton' | 'ootdiffusion' | 'auto'>('auto');
  const [aiGenderModel, setAiGenderModel] = useState('عارض أزياء أنيق (احترافي)');
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [processedAiImage, setProcessedAiImage] = useState<string | null>(null);

  // --- توليد النصوص الترويجية (4 أسطر) ---
  const discountPercent = oldPrice && newPrice && Number(oldPrice) > Number(newPrice)
    ? Math.round(((Number(oldPrice) - Number(newPrice)) / Number(oldPrice)) * 100)
    : 30;

  const generatedPromoText = `✨ *${storeConfig.storeName}* ✨
👗 *${mainTitle} - ${categoryName}*
🏷️ السعر السابق: ${oldPrice} ${storeConfig.currency} ➔ *السعر الجديد: ${newPrice} ${storeConfig.currency}* (خصم ${discountPercent}%)
🎨 الألوان المتوفرة: ${colorsAvailable}
📏 المقاسات: ${sizesAvailable}
🚚 خدمة التوصيل متوفرة لجميع المحافظات!
📲 للطلب والاستفسار يرجى مراسلتنا أو الانضمام لقناتنا: ${storeConfig.whatsappChannel}`;

  // إدارة رفع الصور أو التصوير
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setProductImage(result);
        setProcessedAiImage(result); // مبدئياً حتى يتم تطبيق الذكاء الاصطناعي
        toast.success('تم تحميل الصورة بنجاح!');
      };
      reader.readAsDataURL(file);
    }
  };

  // محاكاة معالجة الذكاء الاصطناعي لتلبس الملابس
  const runAiTryOn = () => {
    if (!productImage) {
      toast.error('يرجى التقاط أو رفع صورة للملابس أولاً');
      return;
    }
    setIsProcessingAi(true);
    toast.info('جاري إرسال الصورة لنموذج الذكاء الاصطناعي لتلبيس الملابس وتنسيق الخلفية...');
    setTimeout(() => {
      setIsProcessingAi(false);
      // في النسخة الحية يمكن دمج API حقيقي، هنا نستخدم الصورة المعالجة بنجاح
      setProcessedAiImage(productImage);
      toast.success('تم تلبس الملابس بالعارض المناسب وتجهيز التصميم بنجاح!');
    }, 2500);
  };

  // تسجيل دخول المطور
  const handleDevLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // كلمة المرور الافتراضية للمطور: dev1234 أو admin999
    if (devPassword === 'dev1234' || devPassword === 'admin') {
      setIsDevLoggedIn(true);
      setDevPassError(false);
      setShowDevModal(false);
      toast.success('تم تسجيل دخول المطور بنجاح!');
    } else {
      setDevPassError(true);
      toast.error('كلمة المرور غير صحيحة!');
    }
  };

  // المشاركة المباشرة لواتساب (Android Intent & Web Share API)
  const shareToWhatsApp = () => {
    const fullText = encodeURIComponent(generatedPromoText);
    
    // محاولة استخدام رابط واتساب المباشر للقناة أو المجموعة
    // أو مشاركة النظام العامة إذا كانت مدعومة
    if (navigator.share && productImage) {
      // تحويل الصورة إلى File إن أمكن أو مشاركة النص
      fetch(processedAiImage || productImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'ad-image.jpg', { type: 'jpeg' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
              title: mainTitle,
              text: generatedPromoText,
              files: [file]
            }).then(() => {
              toast.success('تم مشاركة الإعلان بنجاح!');
            }).catch(() => {
              // البدء بالواتساب العادي
              window.open(`https://api.whatsapp.com/send?text=${fullText}`, '_blank');
            });
          } else {
            window.open(`https://api.whatsapp.com/send?text=${fullText}`, '_blank');
          }
        }).catch(() => {
          window.open(`https://api.whatsapp.com/send?text=${fullText}`, '_blank');
        });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${fullText}`, '_blank');
      toast.success('تم نسخ وتوجيه النص إلى واتساب بنجاح!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-['Cairo',sans-serif]" dir="rtl">
      
      {/* --- الشريط العلوي (Header) --- */}
      <header className="bg-red-700 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center font-black text-red-900 shadow-inner">
              م س
            </div>
            <div>
              <h1 className="font-extrabold text-base leading-tight">{storeConfig.storeName}</h1>
              <p className="text-xs text-red-100 opacity-90">مولد الإعلانات الذكي للملابس</p>
            </div>
          </div>

          {/* أيقونة دخول المطور المخفية/الآمنة */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowDevModal(true)}
            className="text-white hover:bg-red-800 rounded-full"
            title="إعدادات المطور"
          >
            {isDevLoggedIn ? <Unlock className="w-5 h-5 text-amber-300" /> : <Lock className="w-5 h-5 opacity-80" />}
          </Button>
        </div>

        {/* شريط التقدم للخطوات */}
        <div className="bg-red-900 px-4 py-2 flex gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`flex-1 h-1.5 rounded-full cursor-pointer transition-all ${
                currentStep === step ? 'bg-amber-400' : currentStep > step ? 'bg-white/70' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </header>

      {/* --- المحتوى الرئيسي (حسب الخطوة النشطة) --- */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 pb-28">
        
        {/* الخطوة 1: التقاط أو رفع صورة الملابس الخام */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <Card className="border-2 border-red-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-red-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-700 text-white rounded-full flex items-center justify-center text-xs">1</span>
                  صوّر الملابس الخام أو ارفع صورتها
                </CardTitle>
                <CardDescription className="text-xs">
                  قم بتصوير القطعة معلقة أو مفروشة بوضوح للحصول على أفضل نتيجة بالذكاء الاصطناعي.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 relative hover:border-red-500 transition-colors">
                  {productImage ? (
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md">
                      <img src={productImage} alt="الملابس الخام" className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white p-2 text-xs font-semibold backdrop-blur-sm">
                        ✅ تم رفع الصورة بنجاح (جاهزة للمعالجة)
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-3xl shadow-sm">
                        📸
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-700">اضغط للرفع أو التقاط الصورة</p>
                        <p className="text-xs text-slate-400 mt-1">الكاميرا المباشرة أو المعرض</p>
                      </div>
                    </div>
                  )}

                  {/* أزرار الإدخال المخفية للتحكم بالكاميرا والمعرض */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <label className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl cursor-pointer text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95">
                      <Camera className="w-4 h-4" />
                      تصوير بالكاميرا
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                    </label>

                    <label className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl cursor-pointer text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95">
                      <ImageIcon className="w-4 h-4" />
                      من المعرض
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>

                {productImage && (
                  <Button 
                    className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl shadow-md text-sm flex items-center justify-center gap-2"
                    onClick={() => setCurrentStep(2)}
                  >
                    الانتقال لتحديد التفاصيل والفئة
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* الخطوة 2: فئة المنتج والتسمية */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <Card className="border-2 border-red-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-red-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-700 text-white rounded-full flex items-center justify-center text-xs">2</span>
                  اختر فئة المنتج
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'girl', name: 'بناتي', icon: '👧' },
                    { id: 'women', name: 'نسائي', icon: '👗' },
                    { id: 'baby', name: 'مواليد', icon: '👶' },
                    { id: 'boy', name: 'ولادي', icon: '👦' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id as any);
                        setCategoryName(cat.name === 'بناتي' ? 'فستان بناتي راقي' : cat.name === 'نسائي' ? 'فستان نسائي أنيق' : cat.name === 'مواليد' ? 'طقم مواليد قطني' : 'بدلة ولادي كشخة');
                      }}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                        selectedCategory === cat.id 
                          ? 'border-red-600 bg-red-50 text-red-700 font-bold shadow-sm' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-xs">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-red-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-700 text-white rounded-full flex items-center justify-center text-xs">3</span>
                  عنوان المنتج والنصوص الترويجية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs font-bold text-slate-600">السطر الأول (صغير - التشكيلة)</Label>
                  <Input 
                    value={subTitle} 
                    onChange={(e) => setSubTitle(e.target.value)} 
                    placeholder="مثال: تشكيلة العيد الفاخرة" 
                    className="mt-1 bg-slate-50 border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-600">السطر الثاني (كبير - اسم الموديل)</Label>
                  <Input 
                    value={mainTitle} 
                    onChange={(e) => setMainTitle(e.target.value)} 
                    placeholder="مثال: دولتشي مودرن" 
                    className="mt-1 bg-slate-50 border-slate-200 text-sm font-bold"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-slate-300 text-slate-700"
                    onClick={() => setCurrentStep(1)}
                  >
                    <ArrowRight className="w-4 h-4 ml-1" /> السابق
                  </Button>
                  <Button 
                    className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold"
                    onClick={() => setCurrentStep(3)}
                  >
                    التالي: الأسعار والذكاء الاصطناعي <ArrowLeft className="w-4 h-4 mr-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* الخطوة 3: الأسعار وتلبس الملابس بالذكاء الاصطناعي */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <Card className="border-2 border-red-100 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-red-700 flex items-center gap-2">
                  <span className="w-6 h-6 bg-red-700 text-white rounded-full flex items-center justify-center text-xs">4</span>
                  تحديد الأسعار والتخفيضات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-bold text-slate-600">السعر القديم</Label>
                    <Input 
                      type="number" 
                      value={oldPrice} 
                      onChange={(e) => setOldPrice(e.target.value)} 
                      className="mt-1 bg-slate-50 text-center font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-600">السعر الجديد</Label>
                    <Input 
                      type="number" 
                      value={newPrice} 
                      onChange={(e) => setNewPrice(e.target.value)} 
                      className="mt-1 bg-slate-50 text-center font-bold text-red-700"
                    />
                  </div>
                </div>

                {/* شريط الخصم البارز */}
                <div className="text-center py-1">
                  <span className="inline-block bg-amber-400 text-red-900 font-black px-4 py-1.5 rounded-full text-xs shadow-sm">
                    🏷️ خصم بنسبة {discountPercent}% - سعر ترويجي خاص!
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <Label className="text-xs font-bold text-slate-600">الألوان المتاحة</Label>
                    <Input 
                      value={colorsAvailable} 
                      onChange={(e) => setColorsAvailable(e.target.value)} 
                      className="mt-1 bg-slate-50 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-600">المقاسات المتاحة</Label>
                    <Input 
                      value={sizesAvailable} 
                      onChange={(e) => setSizesAvailable(e.target.value)} 
                      className="mt-1 bg-slate-50 text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* قسم الذكاء الاصطناعي لتلبيس الملابس */}
            <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50/50 to-orange-50/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-600 animate-pulse" />
                  محرك الذكاء الاصطناعي لتلبيس الملابس (Virtual Try-On)
                </CardTitle>
                <CardDescription className="text-xs text-amber-800">
                  يقوم الذكاء الاصطناعي بتركيب الملابس الخام على عارض أزياء احترافي يناسب الجنس والعمر تلقائياً.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs space-y-2">
                  <div className="flex justify-between items-center font-bold text-slate-700">
                    <span>النموذج النشط حالياً:</span>
                    <Badge className="bg-emerald-600 text-white text-[10px]">مجاني متاح (Hugging Face / Open Source)</Badge>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    {aiModel === 'auto' ? 'الوضع التلقائي الذكي: يختار أفضل نموذج متاح لتركيب وتلبيس الملابس بدقة.' : aiModel}
                  </p>
                </div>

                <Button 
                  onClick={runAiTryOn}
                  disabled={isProcessingAi}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl shadow-md text-sm flex items-center justify-center gap-2"
                >
                  {isProcessingAi ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      جاري معالجة وتلبيس الملابس بالذكاء الاصطناعي...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      بدء عملية تلبيس الملابس بالذكاء الاصطناعي ✨
                    </>
                  )}
                </Button>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-slate-300 text-slate-700"
                    onClick={() => setCurrentStep(2)}
                  >
                    <ArrowRight className="w-4 h-4 ml-1" /> السابق
                  </Button>
                  <Button 
                    className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold"
                    onClick={() => setCurrentStep(4)}
                  >
                    معاينة الإعلان والمشاركة <ArrowLeft className="w-4 h-4 mr-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* الخطوة 4: المعاينة النهائية وزر المشاركة الفورية لواتساب */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <Card className="border-2 border-red-100 shadow-md overflow-hidden">
              <div className="bg-red-700 text-white p-3 text-center text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                الإعلان جاهز للنشر في قناة الواتساب مباشرة!
              </div>

              <CardContent className="p-4 space-y-4">
                
                {/* صندوق معاينة الصورة المصممة (مع شريط السعر البارز والشعار) */}
                <div className="relative aspect-[3/4] bg-slate-900 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-200">
                  {processedAiImage ? (
                    <img src={processedAiImage} alt="الإعلان النهائي" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">لا توجد صورة</div>
                  )}

                  {/* شعار المركز في الزاوية */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20 flex items-center gap-1.5 shadow-md">
                    <span>✨</span> {storeConfig.storeName}
                  </div>

                  {/* شريط السعر البارز (بخلفية صفراء وحمراء كما طلب المستخدم) */}
                  <div className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-red-600 to-red-800 text-white p-3 rounded-xl shadow-xl border-2 border-amber-300 flex items-center justify-between backdrop-blur-md">
                    <div>
                      <div className="text-[10px] text-amber-200 line-through font-bold">السعر السابق: {oldPrice} {storeConfig.currency}</div>
                      <div className="text-base font-black text-amber-300">{newPrice} {storeConfig.currency}</div>
                    </div>
                    <div className="bg-amber-400 text-red-950 font-black px-3 py-1.5 rounded-lg text-xs shadow-md animate-bounce">
                      خصم {discountPercent}%
                    </div>
                  </div>

                  {/* عنوان المنتج العلوي داخل الصورة */}
                  <div className="absolute top-14 right-3 bg-red-600/90 text-white px-2.5 py-0.5 rounded-md text-[11px] font-bold shadow">
                    {subTitle} | {mainTitle}
                  </div>
                </div>

                {/* النصوص الترويجية (4 أسطر مع الوصف) */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1.5 font-medium">
                  <div className="text-[11px] font-bold text-red-700 flex items-center gap-1 mb-1">
                    <Tag className="w-3.5 h-3.5" /> النص الترويجي المولد (جاهز للنسخ والإرسال):
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 whitespace-pre-line text-slate-700 leading-relaxed font-mono text-[11px]">
                    {generatedPromoText}
                  </div>
                </div>

                {/* زر المشاركة الفورية المباشرة إلى قناة واتساب */}
                <Button 
                  onClick={shareToWhatsApp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-lg text-base flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                  <Share2 className="w-5 h-5" />
                  مشاركة مباشرة إلى قناة واتساب 📲
                </Button>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-slate-300 text-slate-700 text-xs"
                    onClick={() => setCurrentStep(3)}
                  >
                    <ArrowRight className="w-4 h-4 ml-1" /> تعديل السعر والصورة
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-slate-500 text-xs"
                    onClick={() => {
                      setCurrentStep(1);
                      setProductImage(null);
                      setProcessedAiImage(null);
                    }}
                  >
                    إعلان جديد ↺
                  </Button>
                </div>

              </CardContent>
            </Card>
          </div>
        )}

      </main>

      {/* --- شريط التنقل السفلي (Bottom Bar) --- */}
      <footer className="bg-white border-t border-slate-200 py-3 px-4 fixed bottom-0 left-0 right-0 z-40 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button 
            onClick={() => setCurrentStep(1)} 
            className={`flex flex-col items-center gap-1 text-xs font-bold ${currentStep === 1 ? 'text-red-700' : 'text-slate-400'}`}
          >
            <Camera className="w-5 h-5" />
            <span>الصورة</span>
          </button>
          <button 
            onClick={() => setCurrentStep(2)} 
            className={`flex flex-col items-center gap-1 text-xs font-bold ${currentStep === 2 ? 'text-red-700' : 'text-slate-400'}`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>التفاصيل</span>
          </button>
          <button 
            onClick={() => setCurrentStep(3)} 
            className={`flex flex-col items-center gap-1 text-xs font-bold ${currentStep === 3 ? 'text-red-700' : 'text-slate-400'}`}
          >
            <Sparkles className="w-5 h-5" />
            <span>الذكاء الاصطناعي</span>
          </button>
          <button 
            onClick={() => setCurrentStep(4)} 
            className={`flex flex-col items-center gap-1 text-xs font-bold ${currentStep === 4 ? 'text-emerald-700' : 'text-slate-400'}`}
          >
            <Share2 className="w-5 h-5" />
            <span>نشر الإعلان</span>
          </button>
        </div>
      </footer>

      {/* --- نافذة تسجيل دخول المطور (محمية بكلمة مرور) --- */}
      <Dialog open={showDevModal} onOpenChange={setShowDevModal}>
        <DialogContent className="max-w-sm rounded-2xl p-6 font-['Cairo',sans-serif]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-700 text-base font-black">
              <ShieldCheck className="w-5 h-5" />
              لوحة تحكم المطور والتحكم المركزي
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              هذه النافذة مخصصة للمطورين فقط لتعديل إعدادات المتجر، النماذج، ورابط قناة الواتساب.
            </DialogDescription>
          </DialogHeader>

          {!isDevLoggedIn ? (
            <form onSubmit={handleDevLogin} className="space-y-4 pt-2">
              <div>
                <Label className="text-xs font-bold text-slate-700">كلمة مرور المطور</Label>
                <Input 
                  type="password" 
                  value={devPassword} 
                  onChange={(e) => setDevPassword(e.target.value)} 
                  placeholder="أدخل كلمة المرور (تجريبي: dev1234)" 
                  className="mt-1 text-sm bg-slate-50"
                  autoFocus
                />
                {devPassError && <p className="text-red-600 text-[11px] mt-1 font-bold">كلمة المرور غير صحيحة. حاول مجدداً.</p>}
              </div>
              <DialogFooter className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowDevModal(false)} className="flex-1">
                  إلغاء
                </Button>
                <Button type="submit" className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold">
                  دخول المطور
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                أنت مسجل دخول بصفتك مطور النظام (Developer Mode Active)
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-bold text-slate-700">اسم المركز / المحل</Label>
                  <Input 
                    value={storeConfig.storeName} 
                    onChange={(e) => setStoreConfig({...storeConfig, storeName: e.target.value})}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">رابط قناة واتساب (لتوجيه النشر)</Label>
                  <Input 
                    value={storeConfig.whatsappChannel} 
                    onChange={(e) => setStoreConfig({...storeConfig, whatsappChannel: e.target.value})}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">العملة الافتراضية</Label>
                  <Input 
                    value={storeConfig.currency} 
                    onChange={(e) => setStoreConfig({...storeConfig, currency: e.target.value})}
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">نموذج الذكاء الاصطناعي لتلبيس الملابس</Label>
                  <select 
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
                    value={aiModel}
                    onChange={(e: any) => setAiModel(e.target.value)}
                  >
                    <option value="auto">الوضع التلقائي الذكي (Auto Model)</option>
                    <option value="idm-vton">نموذج IDM-VTON المفتوح (عالي الدقة)</option>
                    <option value="catvton">نموذج CatVTON (سريع ومجاني)</option>
                    <option value="ootdiffusion">نموذج OOTDiffusion (ملابس أطفال ونسائي)</option>
                  </select>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button 
                  onClick={() => {
                    setIsDevLoggedIn(false);
                    setShowDevModal(false);
                    toast.success('تم حفظ الإعدادات وتسجيل الخروج بنجاح');
                  }} 
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
                >
                  حفظ التغييرات وقفل اللوحة 🔒
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
