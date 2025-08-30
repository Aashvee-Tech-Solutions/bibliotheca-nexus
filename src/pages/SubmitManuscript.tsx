import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function SubmitManuscript() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [plagiarismChecking, setPlagiarismChecking] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    wordCount: '',
    synopsis: '',
    manuscriptFile: null as File | null,
    samplePages: null as File | null
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { from: location } });
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [fieldName]: file }));
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (error) throw error;
    return data;
  };

  const checkPlagiarism = async (manuscriptText: string, manuscriptId: string) => {
    try {
      setPlagiarismChecking(true);
      
      const { data, error } = await supabase.functions.invoke('plagiarism-check', {
        body: {
          manuscriptText,
          manuscriptId
        }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Plagiarism check failed:', error);
      toast({
        title: "Plagiarism Check Warning",
        description: "Could not complete plagiarism check, but manuscript was submitted successfully.",
        variant: "destructive"
      });
      return null;
    } finally {
      setPlagiarismChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Validation
    if (!formData.title || !formData.genre || !formData.wordCount || !formData.synopsis) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.manuscriptFile) {
      toast({
        title: "No Manuscript File",
        description: "Please upload your manuscript file.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Step 1: Upload manuscript file
      setUploadProgress(25);
      const manuscriptPath = `${user.id}/${Date.now()}_${formData.manuscriptFile.name}`;
      await uploadFile(formData.manuscriptFile, 'manuscripts', manuscriptPath);
      const manuscriptUrl = `${supabase.storage.from('manuscripts').getPublicUrl(manuscriptPath).data.publicUrl}`;

      // Step 2: Upload sample pages if provided
      setUploadProgress(50);
      let samplePagesUrl = null;
      if (formData.samplePages) {
        const samplePath = `${user.id}/${Date.now()}_sample_${formData.samplePages.name}`;
        await uploadFile(formData.samplePages, 'manuscripts', samplePath);
        samplePagesUrl = `${supabase.storage.from('manuscripts').getPublicUrl(samplePath).data.publicUrl}`;
      }

      // Step 3: Create manuscript record
      setUploadProgress(75);
      const { data: manuscript, error: insertError } = await supabase
        .from('manuscripts')
        .insert([{
          title: formData.title,
          genre: formData.genre,
          synopsis: formData.synopsis,
          word_count: parseInt(formData.wordCount) || null,
          user_id: user.id,
          manuscript_file_url: manuscriptUrl,
          sample_pages_url: samplePagesUrl
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      
      // Step 4: Send email notification
      setUploadProgress(85);
      try {
        await supabase.functions.invoke('send-contact-email', {
          body: {
            name: user?.user_metadata?.full_name || 'Unknown',
            email: user?.email || 'unknown@email.com',
            subject: `New Manuscript Submission: ${formData.title}`,
            message: `
              Title: ${formData.title}
              Genre: ${formData.genre}
              Word Count: ${formData.wordCount}
              Synopsis: ${formData.synopsis}
              
              Files uploaded: ${formData.manuscriptFile ? 'Manuscript' : ''} ${formData.samplePages ? 'Sample Pages' : ''}
            `,
            type: 'manuscript'
          }
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }
      
      // Step 5: Run plagiarism check in background
      setUploadProgress(90);
      await checkPlagiarism(formData.synopsis, manuscript.id);

      setUploadProgress(100);

      toast({
        title: "Manuscript Submitted!",
        description: "Your manuscript has been successfully submitted for review."
      });

      // Clear form
      setFormData({
        title: '',
        genre: '',
        wordCount: '',
        synopsis: '',
        manuscriptFile: null,
        samplePages: null
      });

      // Reset file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
      fileInputs.forEach(input => {
        input.value = '';
      });

    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "An error occurred while submitting your manuscript.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          ← Back to Home
        </Button>
        
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Submit Your Manuscript</h1>
          <p className="text-muted-foreground">
            Share your work with AASHVEE Publishers for review and potential publication
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Manuscript Submission Form
          </CardTitle>
          <CardDescription>
            Please provide detailed information about your manuscript
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter your manuscript title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Genre *</Label>
                <Select
                  value={formData.genre}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, genre: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fiction">Fiction</SelectItem>
                    <SelectItem value="non-fiction">Non-Fiction</SelectItem>
                    <SelectItem value="poetry">Poetry</SelectItem>
                    <SelectItem value="biography">Biography</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="philosophy">Philosophy</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wordCount">Word Count *</Label>
                <Input
                  id="wordCount"
                  name="wordCount"
                  type="number"
                  placeholder="Approximate word count"
                  value={formData.wordCount}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="synopsis">Synopsis *</Label>
              <Textarea
                id="synopsis"
                name="synopsis"
                placeholder="Provide a brief synopsis of your manuscript (500-1000 words)"
                className="min-h-[150px]"
                value={formData.synopsis}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="manuscriptFile">Full Manuscript *</Label>
                <div className="relative">
                  <Input
                    id="manuscriptFile"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'manuscriptFile')}
                    disabled={isLoading}
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Accepted formats: PDF, DOC, DOCX
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="samplePages">Sample Pages (Optional)</Label>
                <div className="relative">
                  <Input
                    id="samplePages"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'samplePages')}
                    disabled={isLoading}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  First 10-20 pages for quick review
                </p>
              </div>
            </div>

            {isLoading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading manuscript...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {plagiarismChecking && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Running plagiarism check on your manuscript...
                </AlertDescription>
              </Alert>
            )}

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Please note:</strong> All submissions undergo plagiarism checking and editorial review. 
                You will be notified within 2-4 weeks about the status of your submission.
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                disabled={isLoading || plagiarismChecking}
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Submit Manuscript
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}