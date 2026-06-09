// seed-courses.ts — Run once to insert courses + lessons into Supabase
// Usage: npx tsx scripts/seed-courses.ts

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://gqqbssfgrvcqqkpotycs.supabase.co';
// Read from env or .env file
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';

if (!SUPABASE_KEY) {
  console.error('❌ SUPABASE_KEY not found. Set VITE_SUPABASE_ANON_KEY or SUPABASE_KEY env var.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const COURSES = [
  {
    title: 'إنتاج المحتوى بالذكاء الاصطناعي',
    title_ar: 'إنتاج المحتوى بالذكاء الاصطناعي',
    description: 'كورس عملي متكامل لتعليم صناعة المحتوى بالذكاء الاصطناعي من الصفر حتى الاحتراف. من كتابة البرومبت إلى صناعة إعلان وفيلم كامل.',
    description_ar: 'كورس عملي متكامل لتعليم صناعة المحتوى بالذكاء الاصطناعي من الصفر حتى الاحتراف، بداية من فهم أدوات الذكاء الاصطناعي وكتابة الـ Prompts، مرورًا بتصميم الهوية البصرية واللوجوهات والإعلانات، ثم صناعة الشخصيات الكارتونية، كتابة السيناريو، بناء القصة السينمائية، تحريك المشاهد، إنتاج الصوت، مزامنة الشفاه، المؤثرات البصرية والصوتية، المونتاج، وتلوين الفيديو بشكل سينمائي.',
    thumbnail_url: '/images/course1-ai-content.png',
    price: 0,
    discount_price: null,
    level: 'beginner' as const,
    status: 'published' as const,
    instructor_name: 'م. أحمد الجوهري',
    duration_hours: 24,
    lessons_count: 12,
    students_count: 0,
    rating: 5,
    reviews_count: 0,
    certificate_enabled: true,
    is_featured: true,
    is_free: false,
    what_you_learn: [
      'كتابة Prompts احترافية للصور والفيديو والصوت',
      'استخدام AI Agents لتنظيم وتنفيذ مهام إنتاج المحتوى',
      'تصميم هوية بصرية ولوجو بشكل احترافي',
      'فهم سيكولوجية الألوان واستخدامها في الإعلانات',
      'تصميم إعلانات جذابة مبنية على Storytelling',
      'إنشاء شخصيات كارتونية بأكثر من 13 ستايل مختلف',
      'بناء فيلم كارتوني كامل من الفكرة حتى الإخراج',
      'كتابة سيناريو احترافي ومشاهد منظمة',
      'تحديد زوايا التصوير وحركات الكاميرا داخل البرومبت',
      'صناعة قصة سينمائية متكاملة خطوة بخطوة',
      'استخدام أدوات الصوت في التعليق والأغاني ومزامنة الشفاه',
      'تطبيق VFX وSFX والمونتاج وColor Grading',
    ],
    requirements: [
      'جهاز كمبيوتر أو لابتوب متصل بالإنترنت',
      'لا يشترط خبرة سابقة في التصميم أو المونتاج',
      'الرغبة في تعلم أدوات الذكاء الاصطناعي',
    ],
    target_audience: [
      'صناع المحتوى',
      'المصممون',
      'المسوقون',
      'أصحاب المشاريع',
      'المدربون والمعلمون',
      'أصحاب البراندات',
      'المهتمون بصناعة الفيديو',
    ],
    lessons: [
      { title_ar: 'مدخل إلى إنتاج المحتوى بالذكاء الاصطناعي', description_ar: 'ما هو إنتاج المحتوى بالذكاء الاصطناعي؟ الفرق بين المحتوى التقليدي والمحتوى المدعوم بالـ AI. مراحل إنتاج المحتوى والتطبيق العملي.', duration_minutes: 120 },
      { title_ar: 'احتراف كتابة الـ Prompts واستخدام AI Agents', description_ar: 'البرومبت الاحترافي وعناصره. استخدام AI Agents في تنظيم العمل وبناء وكيل ذكاء اصطناعي.', duration_minutes: 120 },
      { title_ar: 'صناعة الهوية البصرية واللوجوهات وسيكولوجية الألوان', description_ar: 'مفهوم الهوية البصرية وعناصر البراند. سيكولوجية الألوان في التسويق. تصميم لوجو وBrand Kit.', duration_minutes: 120 },
      { title_ar: 'تصميم إعلانات تخطف الانتباه وStorytelling احترافي', description_ar: 'عناصر الإعلان الناجح واستخدام Storytelling. بناء إعلان من 3 مراحل. كتابة نصوص إعلانية وتصميم بوسترات.', duration_minutes: 120 },
      { title_ar: 'إنتاج الصور الاحترافية بالذكاء الاصطناعي', description_ar: 'إنشاء صور واقعية وبوسترات سينمائية وصور منتجات. التحكم في الإضاءة والخلفية وزاوية التصوير.', duration_minutes: 120 },
      { title_ar: 'أكثر من 13 ستايل كارتون وبناء الشخصيات', description_ar: 'تعلم أشهر أنماط الكارتون (3D, 2D, Anime, Manga, Chibi, Comic وغيرها). تصميم شخصية كارتونية من الصفر.', duration_minutes: 120 },
      { title_ar: 'كتابة السيناريو وزوايا التصوير وحركات الكاميرا', description_ar: 'كتابة المشهد السينمائي وتقسيم الفيديو. أهم زوايا التصوير وحركات الكاميرا.', duration_minutes: 120 },
      { title_ar: 'بناء قصة سينمائية احترافية خطوة بخطوة', description_ar: 'بناء العالم القصصي والبطل والصراع. القوس الدرامي وتحويل القصة إلى مشاهد قابلة للتنفيذ.', duration_minutes: 120 },
      { title_ar: 'صناعة فيلم كارتوني كامل بالذكاء الاصطناعي', description_ar: 'مراحل إنتاج الفيلم الكارتوني من الفكرة حتى المونتاج. تحويل كل مشهد إلى Prompt فيديو.', duration_minutes: 120 },
      { title_ar: 'استنساخ الأصوات ومزامنة الشفاه وصناعة الأغاني', description_ar: 'إنتاج التعليق الصوتي ومزامنة الشفاه وصناعة أغنية قصيرة بالـ AI. ضوابط الاستخدام الأخلاقي.', duration_minutes: 120 },
      { title_ar: 'VFX وSFX والمونتاج السينمائي وColor Grading', description_ar: 'المؤثرات البصرية والصوتية. أساسيات المونتاج السينمائي وColor Grading. تجهيز الفيديو للنشر.', duration_minutes: 120 },
      { title_ar: 'مشروع التخرج الكامل', description_ar: 'تنفيذ مشروع كامل: إعلان احترافي أو فيلم كارتوني أو فيديو تعليمي. يشمل الهوية البصرية والبرومبتات والسكريبت والمونتاج.', duration_minutes: 120 },
    ],
  },
  {
    title: 'الذكاء الاصطناعي والبحث العلمي',
    title_ar: 'الذكاء الاصطناعي والبحث العلمي',
    description: 'كورس تدريبي عملي لاستخدام أدوات الذكاء الاصطناعي في البحث العلمي والكتابة الأكاديمية.',
    description_ar: 'كورس تدريبي عملي يساعدك على استخدام أدوات الذكاء الاصطناعي في اختيار الأفكار البحثية، إعداد عناوين الكتب، بناء الهياكل العلمية، تنظيم المصادر، كتابة المحتوى، إعداد العروض التقديمية، إنشاء شروحات بصرية، تصميم مساعد شخصي للبحث، وتحليل البيانات إحصائيًا. ستتعلم استخدام ChatGPT، Gemini، NotebookLM، Napkin AI، Gamma، Grammarly، وGemini Gems.',
    thumbnail_url: '/images/course2-ai-research.png',
    price: 2500,
    discount_price: 2000,
    level: 'intermediate' as const,
    status: 'published' as const,
    instructor_name: 'م. أحمد الجوهري',
    duration_hours: 20,
    lessons_count: 10,
    students_count: 0,
    rating: 5,
    reviews_count: 0,
    certificate_enabled: true,
    is_featured: true,
    is_free: false,
    what_you_learn: [
      'إنتاج فكرة بحثية أو عنوان كتاب احترافي',
      'خطة بحث أو هيكل كتاب كامل',
      'كتابة فصول بأسلوب علمي واضح',
      'تنظيم المصادر داخل NotebookLM',
      'شروحات ورسومات توضيحية باستخدام Napkin AI',
      'عرض تقديمي احترافي باستخدام Gamma',
      'مساعد شخصي مخصص للبحث باستخدام Gemini Gems',
      'تحسين النصوص لغويًا باستخدام Grammarly',
      'تحليل إحصائي مبسط للبيانات',
      'مشروع نهائي يجمع بين البحث والكتابة والعرض والتحليل',
    ],
    requirements: [
      'جهاز كمبيوتر أو لابتوب متصل بالإنترنت',
      'معرفة أساسية باستخدام الكمبيوتر',
      'لا يشترط خبرة سابقة في البحث العلمي',
    ],
    target_audience: [
      'الباحثون',
      'طلاب الدراسات العليا',
      'المعلمون والمدربون',
      'صناع المحتوى التعليمي',
      'مؤلفو الكتب',
    ],
    lessons: [
      { title_ar: 'مقدمة في الذكاء الاصطناعي والبحث العلمي', description_ar: 'أساسيات استخدام AI في البحث الأكاديمي. أهم الأدوات والمنصات المتاحة.', duration_minutes: 120 },
      { title_ar: 'اختيار الفكرة البحثية وصياغة العنوان', description_ar: 'كيفية توليد أفكار بحثية باستخدام ChatGPT وGemini. صياغة عنوان بحث أو كتاب احترافي.', duration_minutes: 120 },
      { title_ar: 'بناء الهيكل العلمي والفصول', description_ar: 'إعداد خطة بحث أو هيكل كتاب كامل. تقسيم الفصول والوحدات بشكل منهجي.', duration_minutes: 120 },
      { title_ar: 'تنظيم المصادر باستخدام NotebookLM', description_ar: 'رفع وتنظيم المراجع والمصادر العلمية. استخدام NotebookLM كمساعد بحثي ذكي.', duration_minutes: 120 },
      { title_ar: 'كتابة المحتوى العلمي بالذكاء الاصطناعي', description_ar: 'كتابة فصول ووحدات بأسلوب علمي واضح. تحسين الصياغة والأسلوب.', duration_minutes: 120 },
      { title_ar: 'الشروحات البصرية باستخدام Napkin AI', description_ar: 'إنشاء رسومات توضيحية وإنفوجرافيك لتبسيط المفاهيم المعقدة.', duration_minutes: 120 },
      { title_ar: 'العروض التقديمية الاحترافية باستخدام Gamma', description_ar: 'تصميم عروض تقديمية أكاديمية احترافية باستخدام الذكاء الاصطناعي.', duration_minutes: 120 },
      { title_ar: 'بناء مساعد بحثي شخصي باستخدام Gemini Gems', description_ar: 'تصميم وتخصيص مساعد ذكي للبحث العلمي يساعدك في المراجعة والتحليل.', duration_minutes: 120 },
      { title_ar: 'التحسين اللغوي والتحليل الإحصائي', description_ar: 'استخدام Grammarly لتحسين النصوص. تحليل إحصائي مبسط للبيانات البحثية.', duration_minutes: 120 },
      { title_ar: 'مشروع التخرج النهائي', description_ar: 'إنتاج مشروع بحثي أو كتاب تعليمي كامل يجمع بين البحث والكتابة والعرض والتحليل.', duration_minutes: 120 },
    ],
  },
];

async function seed() {
  console.log('🚀 Starting course seeding...\n');

  for (const courseData of COURSES) {
    const { lessons, ...courseFields } = courseData;

    // Insert course
    console.log(`📚 Inserting course: ${courseFields.title_ar}...`);
    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .insert(courseFields)
      .select('id')
      .single();

    if (courseErr) {
      console.error(`❌ Error inserting course "${courseFields.title_ar}":`, courseErr.message);
      continue;
    }

    console.log(`✅ Course created: ${course.id}`);

    // Insert lessons
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const { error: lessonErr } = await supabase.from('lessons').insert({
        course_id: course.id,
        title: lesson.title_ar,
        title_ar: lesson.title_ar,
        description: lesson.description_ar,
        description_ar: lesson.description_ar,
        order_index: i + 1,
        duration_minutes: lesson.duration_minutes,
        is_preview: i === 0, // First lesson is preview
        is_published: true,
      });

      if (lessonErr) {
        console.error(`  ❌ Lesson ${i + 1} error:`, lessonErr.message);
      } else {
        console.log(`  ✅ Lesson ${i + 1}: ${lesson.title_ar}`);
      }
    }

    console.log('');
  }

  console.log('🎉 Done!');
}

seed().catch(console.error);

