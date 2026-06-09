import { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, BookOpen, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import AdminLayout from '@/components/layouts/AdminLayout';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';
import type { Profile, Enrollment } from '@/types/types';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<Enrollment[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
    let query = supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (search.trim()) {
      query = query.or(`full_name.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`);
    }
    const { data } = await query;
    setStudents(Array.isArray(data) ? (data as Profile[]) : []);
    } catch (err) {
      console.error('AdminStudentsPage.tsx fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openDetail = async (student: Profile) => {
    setSelectedStudent(student);
    setDetailOpen(true);
    const { data } = await supabase
      .from('enrollments')
      .select('*, courses(title_ar)')
      .eq('student_id', student.id)
      .order('enrolled_at', { ascending: false });
    setStudentEnrollments(Array.isArray(data) ? (data as Enrollment[]) : []);
  };

  const toggleActive = async (student: Profile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !student.is_active })
      .eq('id', student.id);
    if (!error) {
      toast.success(student.is_active ? 'تم إيقاف الحساب' : 'تم تفعيل الحساب');
      fetchStudents();
    }
  };

  const roleLabels: Record<string, string> = { user: 'طالب', admin: 'مدير', instructor: 'مدرب' };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">إدارة الطلاب</h1>
        <p className="text-muted-foreground text-sm mt-1">{students.length} مستخدم</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 end-3 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="بحث بالاسم أو البريد الإلكتروني..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pe-10 bg-card border-border"
        />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">المستخدم</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الدور</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">تاريخ التسجيل</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">الحالة</th>
                <th className="text-start px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-8 bg-muted rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">لا توجد نتائج</td>
                </tr>
              ) : students.map((student, i) => (
                <tr key={student.id} className={`text-sm ${i > 0 ? 'border-t border-border' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary text-xs font-semibold">{student.full_name?.charAt(0) || '?'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground text-xs font-medium truncate max-w-32">{student.full_name || 'مستخدم'}</p>
                        <p className="text-muted-foreground text-xs truncate max-w-32">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant="outline" className="text-xs">
                      {roleLabels[student.role] || student.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs ltr-number whitespace-nowrap">
                    {new Date(student.created_at).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant="outline" className={`text-xs ${student.is_active ? 'text-success bg-success/10 border-success/30' : 'text-destructive bg-destructive/10 border-destructive/30'}`}>
                      {student.is_active ? 'نشط' : 'موقوف'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openDetail(student)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => toggleActive(student)}>
                        {student.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>بيانات الطالب</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">{selectedStudent.full_name?.charAt(0) || '?'}</span>
                </div>
                <div>
                  <p className="text-foreground font-medium">{selectedStudent.full_name || 'مستخدم'}</p>
                  <p className="text-muted-foreground text-sm">{selectedStudent.email}</p>
                  {selectedStudent.phone && <p className="text-muted-foreground text-xs ltr-number">{selectedStudent.phone}</p>}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  الكورسات المشترك بها ({studentEnrollments.length})
                </h3>
                {studentEnrollments.length === 0 ? (
                  <p className="text-muted-foreground text-xs">لا توجد اشتراكات</p>
                ) : (
                  <div className="space-y-1">
                    {studentEnrollments.map(en => {
                      const course = en.courses as unknown as { title_ar: string };
                      return (
                        <div key={en.id} className="flex items-center justify-between p-2 rounded border border-border bg-card text-xs">
                          <span className="text-foreground">{course?.title_ar || 'كورس'}</span>
                          <Badge variant="outline" className="text-xs">{en.status}</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}



