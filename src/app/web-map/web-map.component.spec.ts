import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebMapComponent } from './web-map.component';

describe('WebMapComponent', () => {
  let component: WebMapComponent;
  let fixture: ComponentFixture<WebMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebMapComponent]
    });
    fixture = TestBed.createComponent(WebMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
