import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { NotificationsService } from 'angular2-notifications';

import { InputWithDropdownEditorComponent } from '../../../shared/core/input-with-dropdown/input-with-dropdown-editor.component';
import { InputWithDropdownRenderComponent } from '../../../shared/core/input-with-dropdown/input-with-dropdown-render.component';


import { ProductService } from 'app/shared/services';
import { Product } from 'app/models';
import { config } from 'app/config';

@Component({
  selector: 'app-disposable',
  templateUrl: './disposable.component.html',
  styleUrls: ['./disposable.component.scss']
})
export class DisposableComponent implements OnInit {
disposables: Product[];
elements: any[];

  data: any[];
  settings = {
    columns: {
      name: {
        title: 'Nombre'
      },
      price: {
        title: 'Precio'
      },
      quantity: {
        title: 'Cantidad'
      },
      unit: {
        title: 'Unidad',
        renderComponent: InputWithDropdownRenderComponent,
        editor: {
          type: 'custom',
          component: InputWithDropdownEditorComponent,
          config: { elements: this.elements },
        }
      }
    }
  };
  constructor(private notification: NotificationsService,
              private productService: ProductService) { }

  ngOnInit() {
    // Settings
    this.settings = _.assign(this.settings, config.ng2SmartTableDefaultSettings);

    this.elements = [...config.units.length, config.units.unit]
      .map(unit => {
        return {title: unit.unit, value: unit.unit};
      });
    console.log(this.elements);
    // Data
    this.productService.get({type: 'disposable'}).subscribe(disposables => {
      this.disposables = disposables;
      this.data = disposables.map(disposable => this.desmaterializeDisposable(disposable));
    });
  }

  onCreate(event) {
    const disposable = this.materializeDisposable(event.newData);

    this.productService.post(disposable).subscribe(disposable => {
      event.confirm.resolve(this.desmaterializeDisposable(disposable));
    });
    console.log(disposable);
  }

  onEdit(event) {
    const disposableId = event.newData._id;
    const disposable = this.materializeDisposable(event.newData);

    this.productService.put(disposableId, disposable).subscribe( disposable => {
      event.confirm.resolve(this.desmaterializeDisposable(disposable));
    });
  }

  onDelete(event) {
    const disposableId = event.data._id;

    this.productService.delete(disposableId).subscribe(() => {
      event.confirm.resolve();
    });
  }

  private desmaterializeDisposable(product: Product): any {
    return {
      _id: product._id,
      name: product.name,
      price: product.price.value,
      quantity: product.price.quantity.value,
      unit: product.price.quantity.unit
    };
  }

  private materializeDisposable(data): Product {
    return {
      name: data.name,
      type: 'disposable',
      price: {
        value: data.price,
        quantity: {
          value: data.quantity,
          unit: data.unit
        }
      }
    };
  }

}
