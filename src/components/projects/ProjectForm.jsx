
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const PROJECT_TYPES = ["kitchen", "bathroom", "living_room", "bedroom", "outdoor", "whole_house", "basement", "attic", "other"];
const PROJECT_STATUSES = ["planning", "in_progress", "on_hold", "completed"];

const defaultProject = {
  name: '',
  description: '',
  type: 'other',
  status: 'planning',
  budget: 0,
  start_date: '',
  target_completion: '',
  progress_percentage: 0,
};

export default function ProjectForm({ isOpen, onClose, onSubmit, project }) {
  const { t } = useTranslation();

  const PROJECT_TYPE_LABELS = {
    kitchen: t("common.projectTypes.kitchen"), bathroom: t("common.projectTypes.bathroom"), living_room: t("common.projectTypes.living_room"),
    bedroom: t("common.projectTypes.bedroom"), outdoor: t("common.projectTypes.outdoor"), whole_house: t("common.projectTypes.whole_house"),
    basement: t("common.projectTypes.basement"), attic: t("common.projectTypes.attic"), other: t("common.projectTypes.other")
  };

  const PROJECT_STATUS_LABELS = {
    planning: t("common.projectStatus.planning"), in_progress: t("common.projectStatus.in_progress"),
    on_hold: t("common.projectStatus.on_hold"), completed: t("common.projectStatus.completed")
  };

  const [formData, setFormData] = useState(project || defaultProject);

  useEffect(() => {
    setFormData(project ? { ...defaultProject, ...project } : defaultProject);
  }, [project, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="apple-blur sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {project ? t("projects.form.editProject") : t("projects.form.createNewProject")}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div>
            <Label htmlFor="name">{t("projects.form.projectName")}</Label>
            <Input id="name" value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder={t("projects.form.projectNamePlaceholder")} required />
          </div>

          <div>
            <Label htmlFor="description">{t("projects.detail.description")}</Label>
            <Textarea id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder={t("projects.form.descriptionPlaceholder")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("projects.form.typeLabel")}</Label>
              <Select value={formData.type} onValueChange={value => handleChange('type', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="apple-blur">
                  {PROJECT_TYPES.map(type => <SelectItem key={type} value={type}>{PROJECT_TYPE_LABELS[type] || type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t("projects.form.statusLabel")}</Label>
              <Select value={formData.status} onValueChange={value => handleChange('status', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="apple-blur">
                  {PROJECT_STATUSES.map(status => <SelectItem key={status} value={status}>{PROJECT_STATUS_LABELS[status] || status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="budget">{t("projects.form.budgetLabel")}</Label>
            <Input
              id="budget"
              type="number"
              inputMode="decimal"
              min="0"
              value={formData.budget || ''}
              placeholder="25000"
              onFocus={e => e.target.select()}
              onChange={e => handleChange('budget', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">{t("projects.detail.startDate")}</Label>
              <Input id="start_date" type="date" value={formData.start_date || ''} onChange={e => handleChange('start_date', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="target_completion">{t("projects.form.targetCompletionLabel")}</Label>
              <Input id="target_completion" type="date" value={formData.target_completion || ''} onChange={e => handleChange('target_completion', e.target.value)} />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-700">{t("common.cancel")}</Button>
            </DialogClose>
            <Button type="submit" className="btn-primary">{project ? t("projects.form.saveChanges") : t("common.createProject")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
