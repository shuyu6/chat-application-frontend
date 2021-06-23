import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IMessage, IUser } from "../../../assets/interfaces/shared.interface";

@Component({
  selector: "chat-window",
  templateUrl: "./chat-window.component.html",
  styleUrls: ["./chat-window.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWindowComponent {
  @Input() chatRoomId: string;
  @Input() selectedUser: IUser;
  @Input() messages: IMessage[];
  @Output() onMessage = new EventEmitter<string>();

  public inputForm: FormGroup;
  
  constructor(private fb: FormBuilder) {
    this.initForm();
  }

  private initForm() {
    this.inputForm = this.fb.group({
      text: ['', Validators.required]
    });
  }

  public onSubmit(){
    let message = this.inputForm.value.text;
    console.log(message);
    this.inputForm.reset();
    this.onMessage.emit(message);
  }
}
