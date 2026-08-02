
import React, { useState, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';

const PdfPreview = lazy(() => import('./PdfPreview'));
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Save,
    X,
    FileText,
    Eye,
    Sparkles,
    ExternalLink,
    Tag,
    DollarSign,
    Calendar,
    Building,
    ShieldCheck // Added ShieldCheck icon
} from "lucide-react";
import { format } from "date-fns";

const DOCUMENT_TYPES = [
  "invoice", "receipt", "contract", "permit", "blueprint",
  "photo", "warranty", "manual", "estimate", "other"
];

const CATEGORIES = [
  "materials", "labor", "permits", "appliances", "fixtures",
  "tools", "utilities", "insurance", "other"
];

const PHASES = [
  "design", "permits", "demolition", "structural", "electrical",
  "plumbing", "insulation", "drywall", "flooring", "painting",
  "fixtures", "final_touches"
];

export default function DocumentPreview({
  extractedData,
  projects,
  preselectedProjectId,
  onSave,
  onCancel,
  isProcessing
}) {
  const { t } = useTranslation();

  const DOCUMENT_TYPE_LABELS = {
    invoice: t("common.documentTypes.invoice"),
    receipt: t("common.documentTypes.receipt"),
    contract: t("common.documentTypes.contract"),
    permit: t("common.documentTypes.permit"),
    blueprint: t("common.documentTypes.blueprint"),
    photo: t("common.documentTypes.photo"),
    warranty: t("common.documentTypes.warranty"),
    manual: t("common.documentTypes.manual"),
    estimate: t("common.documentTypes.estimate"),
    other: t("common.documentTypes.other"),
  };

  const CATEGORY_LABELS = {
    materials: t("common.categories.materials"),
    labor: t("common.categories.labor"),
    permits: t("common.categories.permits"),
    appliances: t("common.categories.appliances"),
    fixtures: t("common.categories.fixtures"),
    tools: t("common.categories.tools"),
    utilities: t("common.categories.utilities"),
    insurance: t("common.categories.insurance"),
    other: t("common.categories.other"),
  };

  const PHASE_LABELS = {
    design: t("upload.phases.design"),
    permits: t("upload.phases.permits"),
    demolition: t("upload.phases.demolition"),
    structural: t("upload.phases.structural"),
    electrical: t("upload.phases.electrical"),
    plumbing: t("upload.phases.plumbing"),
    insulation: t("upload.phases.insulation"),
    drywall: t("upload.phases.drywall"),
    flooring: t("upload.phases.flooring"),
    painting: t("upload.phases.painting"),
    fixtures: t("upload.phases.fixtures"),
    final_touches: t("upload.phases.final_touches"),
  };

  const [editedData, setEditedData] = useState({
    title: extractedData.title || '',
    type: extractedData.type || 'other',
    category: extractedData.category || 'other',
    vendor: extractedData.vendor || '',
    amount: extractedData.amount || '',
    date: extractedData.date || format(new Date(), 'yyyy-MM-dd'),
    warranty_end_date: extractedData.warranty_end_date || '',
    phase: extractedData.phase || 'design',
    project_id: preselectedProjectId || '',
    tags: extractedData.tags || [],
    notes: extractedData.notes || '',
    file_url: extractedData.file_url,
    ai_extracted_data: extractedData.ai_extracted_data
  });

  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = (tag) => {
    if (tag.trim() && !editedData.tags.includes(tag.trim())) {
      setEditedData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setEditedData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Document Preview */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              {t("upload.preview.documentPreview")}
            </div>
            <a
              href={extractedData.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
            {extractedData.file_url && extractedData.file_url.toLowerCase().includes('.pdf') ? (
              <Suspense fallback={<div className="text-sm text-slate-400">{t("upload.preview.loadingPdf")}</div>}>
                <PdfPreview url={extractedData.file_url} />
              </Suspense>
            ) : (
              <img
                src={extractedData.file_url}
                alt={t("upload.preview.documentAlt")}
                className="w-full h-full object-contain"
              />
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-slate-700">
              {t("upload.preview.aiExtracted", { count: Object.keys(extractedData.ai_extracted_data || {}).length })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-slate-600" />
            {t("upload.preview.reviewData")}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-semibold text-slate-700">
                {t("upload.preview.titleLabel")}
              </Label>
              <Input
                id="title"
                value={editedData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder={t("upload.preview.titlePlaceholder")}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-slate-700">{t("upload.preview.typeLabel")}</Label>
                <Select
                  value={editedData.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {DOCUMENT_TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-slate-700">{t("upload.preview.categoryLabel")}</Label>
                <Select
                  value={editedData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {CATEGORY_LABELS[category]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Financial & Vendor Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <Building className="w-3 h-3" />
                {t("upload.preview.vendorLabel")}
              </Label>
              <Input
                value={editedData.vendor}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                placeholder={t("upload.preview.vendorPlaceholder")}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {t("upload.preview.amountLabel")}
              </Label>
              <Input
                type="number"
                step="0.01"
                value={editedData.amount}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>

          {/* Project & Phase */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700">{t("upload.preview.projectLabel")}</Label>
              <Select
                value={editedData.project_id}
                onValueChange={(value) => handleInputChange('project_id', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t("upload.preview.projectPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>{t("common.noProject")}</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-700">{t("upload.preview.phaseLabel")}</Label>
              <Select
                value={editedData.phase}
                onValueChange={(value) => handleInputChange('phase', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PHASES.map((phase) => (
                    <SelectItem key={phase} value={phase}>
                      {PHASE_LABELS[phase]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Warranty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {t("upload.preview.dateLabel")}
              </Label>
              <Input
                type="date"
                value={editedData.date || ''}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {t("upload.preview.warrantyLabel")}
              </Label>
              <Input
                type="date"
                value={editedData.warranty_end_date || ''}
                onChange={(e) => handleInputChange('warranty_end_date', e.target.value)}
                className="mt-1"
                placeholder={t("upload.preview.warrantyPlaceholder")}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {t("upload.preview.tagsLabel")}
            </Label>
            <div className="mt-1 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder={t("upload.preview.tagsPlaceholder")}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput))}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addTag(tagInput)}
                  disabled={!tagInput.trim()}
                >
                  {t("upload.preview.addTag")}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editedData.tags.map((tag) => (
                  <Badge 
                    key={tag}
                    variant="secondary"
                    className="bg-slate-100 text-slate-800 hover:bg-slate-200 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-sm font-semibold text-slate-700">{t("upload.preview.notesLabel")}</Label>
            <Textarea
              value={editedData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder={t("upload.preview.notesPlaceholder")}
              rows={3}
              className="mt-1"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t border-slate-100 p-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
          >
            <X className="w-4 h-4 mr-2" />
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => onSave(editedData)}
            disabled={isProcessing || !editedData.title.trim()}
            className="renovation-gradient"
          >
            <Save className="w-4 h-4 mr-2" />
            {isProcessing ? t("upload.preview.saving") : t("upload.preview.saveDocument")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
