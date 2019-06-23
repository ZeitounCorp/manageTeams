import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateClientPage } from './create-client.page';

describe('CreateClientPage', () => {
  let component: CreateClientPage;
  let fixture: ComponentFixture<CreateClientPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateClientPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateClientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
