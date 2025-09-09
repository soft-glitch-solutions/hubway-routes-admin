import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Documentation {
  id: string;
  title: string;
  content: string;
  status: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

const DocumentationManagement = () => {
  const { toast } = useToast();
  const [docs, setDocs] = useState<Documentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Documentation | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft',
    tags: ''
  });

  useEffect(() => {
    fetchDocumentation();
  }, []);

  const fetchDocumentation = async () => {
    try {
      const { data, error } = await supabase
        .from('help_documentation')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocs(data || []);
    } catch (error) {
      console.error('Error fetching documentation:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documentation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const docData = {
        title: formData.title,
        content: formData.content,
        status: formData.status,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editingDoc) {
        const { error } = await supabase
          .from('help_documentation')
          .update({
            ...docData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingDoc.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Documentation updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('help_documentation')
          .insert([{
            ...docData,
            created_by: (await supabase.auth.getUser()).data.user?.id
          }]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Documentation created successfully",
        });
      }

      setIsCreateDialogOpen(false);
      setEditingDoc(null);
      setFormData({ title: '', content: '', status: 'draft', tags: '' });
      fetchDocumentation();
    } catch (error) {
      console.error('Error saving documentation:', error);
      toast({
        title: "Error",
        description: "Failed to save documentation",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (doc: Documentation) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      content: doc.content,
      status: doc.status,
      tags: doc.tags?.join(', ') || ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this documentation?')) return;

    try {
      const { error } = await supabase
        .from('help_documentation')
        .delete()
        .eq('id', docId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Documentation deleted successfully",
      });
      fetchDocumentation();
    } catch (error) {
      console.error('Error deleting documentation:', error);
      toast({
        title: "Error",
        description: "Failed to delete documentation",
        variant: "destructive",
      });
    }
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documentation Management</h1>
          <p className="text-muted-foreground">Create and manage help documentation</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingDoc(null);
              setFormData({ title: '', content: '', status: 'draft', tags: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Documentation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDoc ? 'Edit Documentation' : 'Create New Documentation'}</DialogTitle>
              <DialogDescription>
                {editingDoc ? 'Update your documentation' : 'Create new help documentation'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter documentation title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your documentation content here..."
                  rows={10}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="help, guide, faq"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingDoc ? 'Update Documentation' : 'Create Documentation'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="search">Search Documentation</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="status-filter">Filter by Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documentation List */}
      <div className="space-y-4">
        {filteredDocs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No documentation found</p>
            </CardContent>
          </Card>
        ) : (
          filteredDocs.map((doc) => (
            <Card key={doc.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {doc.title}
                    <Badge variant={doc.status === 'published' ? 'default' : 'secondary'}>
                      {doc.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Created: {new Date(doc.created_at).toLocaleDateString()}
                    • Updated: {new Date(doc.updated_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(doc)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(doc.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2 line-clamp-3">
                  {doc.content.substring(0, 200)}...
                </p>
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentationManagement;