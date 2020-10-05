import { Injectable, OnInit } from "@angular/core";
import { NameResolverModel } from "../models/name-resolver.model";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class NameResolverService implements OnInit {
  private base: NameResolverModel[] = [];
  sizeControl = new BehaviorSubject(this.base);

  constructor() { }

  ngOnInit() {
    this.sizeControl.subscribe(() => {
      console.log('Размер резолвера ' + this.base.length);
      if (this.base.length > 1000) this.resetResolver();
    })
  }

  addName(id: string, title: string) {
    let element = new NameResolverModel(id, title);
    this.base.push(element);
    console.log(element.id + ' = ' + element.title);
  }

  resolveId(id: string): NameResolverModel {
    let res = this.base.find(x => x.id === id);
    if (res) return res;
    return null;
  }

  resetResolver() {
    this.base = [];
  }
}
