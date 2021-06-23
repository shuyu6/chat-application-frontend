import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IUser } from 'src/assets/interfaces/shared.interface';


@Injectable()
export class LoginService {
    url: string = "http://localhost:9001/user"
    constructor(private http: HttpClient) { }

    public userLogin(username: string){
        return this.http.post(this.url+"/login", {username: username})
            .toPromise()
            .then(res=>{
                let userId = res['userId'];
                sessionStorage.setItem("user_id", userId);
                sessionStorage.setItem("username", username);
                return res;
            });
    }
    public userList(){
        return this.http.get<any[]>(this.url + "/list")
        .toPromise();
    }
}