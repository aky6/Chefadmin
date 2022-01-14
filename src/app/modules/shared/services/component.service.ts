import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComponentService {
  private componentSubject: BehaviorSubject<string>;
  public currentComponent: Observable<string>;

  constructor() {
    this.componentSubject = new BehaviorSubject<string>('');
    this.currentComponent = this.componentSubject.asObservable();
  }

  updateComponent(component: string) {
    return this.componentSubject.next(component);
  }
}
