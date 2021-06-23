import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { IMessage, IUser } from "../../../assets/interfaces/shared.interface";

@Component({
  selector: "chat-window",
  templateUrl: "./chat-window.component.html",
  styleUrls: ["./chat-window.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWindowComponent{
  @ViewChild('scrollframe', {static: false}) scrollFrame: ElementRef;
  @ViewChildren('messagesList') itemElements: QueryList<any>;
  
  @Input() chatRoomId: string;
  @Input() selectedUser: IUser;
  @Input() messages: IMessage[];
  @Input() messageReceivedSubsriber: Subject<any>;
  @Input() isRefreshing: boolean;
  @Output() onMessage = new EventEmitter<string>();
  @Output() onRequestPreviousMessage = new EventEmitter<string>();


  public inputForm: FormGroup;
  private scrollContainer: any;
  private isNearBottom: boolean;

  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  ngAfterViewInit(){
    this.scrollContainer = this.scrollFrame.nativeElement;  
    this.itemElements.changes.subscribe(v => { 
      this.onItemElementsChanged();
    });
  }

  private initForm() {
    this.inputForm = this.fb.group({
      text: ['', Validators.required]
    });
  }

  public onSubmit(){
    let message = this.inputForm.value.text;
    this.inputForm.reset();
    this.onMessage.emit(message);
  }

  private onItemElementsChanged(): void {
    if (this.isNearBottom) {
      this.scrollToBottom();
    }
  }

  scrolled(event: any): void {
    this.isNearBottom = this.isUserNearBottom();
    if(this.scrollContainer.scrollTop < 10) this.onRequestPreviousMessage.emit();
  }

  private scrollToBottom(): void {
    this.scrollContainer.scroll({
      top: this.scrollContainer.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  private isUserNearBottom(): boolean {
    const threshold = 50;
    const position = this.scrollContainer.scrollTop + this.scrollContainer.offsetHeight;
    const height = this.scrollContainer.scrollHeight;
    return position > height - threshold;
  }
}
