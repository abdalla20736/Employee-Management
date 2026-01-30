import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgZone,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const SIGNATURE_FILE_NAME = 'signature.png';
const SIGNATURE_MIME = 'image/png';
const LIVE_PREVIEW_THROTTLE_MS = 150;

@Component({
  selector: 'app-signature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signature.component.html',
  styleUrl: './signature.component.css',
})
export class SignatureComponent implements AfterViewInit {
  @Input() signature: string = '';
  @Output() signatureChange = new EventEmitter<string>();
  @Output() signatureFileChange = new EventEmitter<File | null>();
  @Output() signatureExportError = new EventEmitter<string>();
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private ngZone = inject(NgZone);
  private lastPreviewEmit = 0;

  ngAfterViewInit(): void {
    const canvasEl = this.canvas.nativeElement;
    this.ctx = canvasEl.getContext('2d')!;
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    if (this.signature) {
      this.loadSignature(this.signature);
    }
  }

  startDrawing(event: MouseEvent | TouchEvent): void {
    this.isDrawing = true;
    const point = this.getPoint(event);
    this.ctx.beginPath();
    this.ctx.moveTo(point.x, point.y);
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing) return;
    event.preventDefault();
    const point = this.getPoint(event);
    this.ctx.lineTo(point.x, point.y);
    this.ctx.stroke();
    this.emitLivePreview();
  }

  stopDrawing(): void {
    if (this.isDrawing) {
      this.isDrawing = false;
      this.updateSignature();
    }
  }

  clear(): void {
    const canvasEl = this.canvas.nativeElement;
    this.ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    this.signature = '';
    this.signatureChange.emit('');
    this.signatureFileChange.emit(null);
  }

  useCanvasAsImage(): void {
    const canvasEl = this.canvas.nativeElement;
    try {
      const dataUrl = canvasEl.toDataURL(SIGNATURE_MIME);
      this.signature = dataUrl;
      this.signatureChange.emit(this.signature);
      const file = this.dataURLtoFile(dataUrl, SIGNATURE_FILE_NAME);
      this.signatureFileChange.emit(file);
    } catch {
      this.signatureExportError.emit(
        'Signature could not be exported. Please clear the canvas and draw your signature again.',
      );
    }
  }

  private dataURLtoFile(dataURL: string, filename: string): File {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || SIGNATURE_MIME;
    const bstr = atob(arr[1]);
    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    return new File([u8arr], filename, { type: mime });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.ngZone.run(() => this.signatureFileChange.emit(file));
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvasEl = this.canvas.nativeElement;
          this.ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
          this.ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);
          this.updateSignature();
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  private emitLivePreview(): void {
    const now = Date.now();
    if (now - this.lastPreviewEmit < LIVE_PREVIEW_THROTTLE_MS) return;
    this.lastPreviewEmit = now;
    try {
      const canvasEl = this.canvas.nativeElement;
      const dataUrl = canvasEl.toDataURL(SIGNATURE_MIME);
      this.signature = dataUrl;
      this.signatureChange.emit(dataUrl);
    } catch {
    }
  }

  private getPoint(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const canvasEl = this.canvas.nativeElement;
    const rect = canvasEl.getBoundingClientRect();

    if (event instanceof MouseEvent) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    } else {
      const touch = event.touches[0] || event.changedTouches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
  }

  private updateSignature(): void {
    const canvasEl = this.canvas.nativeElement;
    try {
      this.signature = canvasEl.toDataURL(SIGNATURE_MIME);
      this.signatureChange.emit(this.signature);
      canvasEl.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], SIGNATURE_FILE_NAME, { type: SIGNATURE_MIME });
            this.ngZone.run(() => this.signatureFileChange.emit(file));
          }
        },
        SIGNATURE_MIME,
        1,
      );
    } catch {
    }
  }

  private loadSignature(dataUrl: string): void {
    const img = new Image();
    if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      const canvasEl = this.canvas.nativeElement;
      this.ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      this.ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);
      this.updateSignature();
    };
    img.src = dataUrl;
  }
}
