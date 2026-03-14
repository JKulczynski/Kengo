
import React, { useState, useEffect } from 'react';
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
            {project ? 'Edytuj projekt' : 'Utwórz nowy projekt'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div>
            <Label htmlFor="name">Nazwa projektu</Label>
            <Input id="name" value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="np. Remont łazienki" required />
          </div>

          <div>
            <Label htmlFor="description">Opis</Label>
            <Textarea id="description" value={formData.description} onChange={e => handleChange('description', e.target.value)} placeholder="Krótki opis projektu" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Typ</Label>
              <Select value={formData.type} onValueChange={value => handleChange('type', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="apple-blur">
                  {PROJECT_TYPES.map(type => <SelectItem key={type} value={type}>{type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={value => handleChange('status', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="apple-blur">
                  {PROJECT_STATUSES.map(status => <SelectItem key={status} value={status}>{status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="budget">Budżet (PLN)</Label>
            <Input id="budget" type="number" value={formData.budget} onChange={e => handleChange('budget', parseFloat(e.target.value) || 0)} placeholder="25000" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data rozpoczęcia</Label>
              <Input id="start_date" type="date" value={formData.start_date || ''} onChange={e => handleChange('start_date', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="target_completion">Planowane zakończenie</Label>
              <Input id="target_completion" type="date" value={formData.target_completion || ''} onChange={e => handleChange('target_completion', e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Progress: {formData.progress_percentage}%</Label>
            <Slider
              value={[formData.progress_percentage]}
              onValueChange={([value]) => handleChange('progress_percentage', value)}
              max={100}
              step={1}
            />
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-gray-200 dark:border-gray-700">Anuluj</Button>
            </DialogClose>
            <Button type="submit" className="btn-primary">{project ? 'Zapisz zmiany' : 'Utwórz projekt'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
