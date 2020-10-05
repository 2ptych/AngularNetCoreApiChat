import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { Router, NavigationStart } from "@angular/router";
import { NotificationService } from "../services/notification.service";
import { NotificationModel, NoteType } from "../models/notification.model";

@Component({
  selector: 'alert',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notificationMessages: NotificationModel[] = [];
  notificationSubscription: Subscription;
  routeSubscription: Subscription;

  constructor(private notificationService: NotificationService,
    private router: Router) { }

  ngOnInit() {
    // подписка на уведомления
    this.notificationSubscription = this.notificationService
      .onNotify()
      .subscribe(message => {
        if (message.message) {
          this.notificationMessages.push(message);
          setTimeout(() => this.removeNote(message), 3200);
        }
        else {
          // если пришло пустое сообщение,
          // то удалить все сообщения
          this.notificationMessages = [];
        }
      });

    this.routeSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // очистить уведомления
        this.notificationService.clear();
      }
    })
  }

  ngOnDestroy() {
    this.notificationSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }

  removeNote(message: NotificationModel) {
    if (!this.notificationMessages.includes(message)) return;

    this.notificationMessages = this.notificationMessages.filter(note => note !== message);
    console.log("removeNote: сообщение удалено");
  }

  getCss(message: NotificationModel) {
    const messageTypeClass = {
      [NoteType.Error]: 'alert alert-danger',
      [NoteType.Success]: 'alert alert-success',
      [NoteType.Info]: 'alert alert-info',
      [NoteType.Warning]: 'alert alert-warning'
    }
    const classes = ['notification-block'];

    classes.push(messageTypeClass[message.type]);

    //classes.push('fade');

    return classes.join(' ');
  }
}
