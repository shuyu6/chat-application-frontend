import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IUser } from "src/assets/interfaces/shared.interface";
import { LoginService } from './login.component.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public inputForm: FormGroup;
  private username: string;

  constructor(private router:Router,
      private fb: FormBuilder,
      private loginService: LoginService) {
    this.initForm();
  }

  ngOnInit() {
  }

  private initForm() {
    this.inputForm = this.fb.group({
      username: ['', Validators.required]
    });
  }
  onSubmit(){
    this.loginService.userLogin(this.username)
      .then(res =>{
        this.router.navigate(["./chat"]);
      });
  }

}
