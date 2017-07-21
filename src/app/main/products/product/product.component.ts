import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as _ from 'lodash';

import { Product, Subproduct } from '../../../models';
import { ProductService } from '../../../shared/services';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  product: Product;
  form: FormGroup;
  price: number;

  constructor(private route: ActivatedRoute,
              private fb: FormBuilder,
              private productService: ProductService) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const productId = params['productId'];

      if(productId) {
        this.productService.getById(productId)
          .subscribe((product: Product) => {
            this.product = product;
            this.buildForm(this.product);

            if(this.product.subproducts) {
              this.calculatePrice(this.product.subproducts);
            }
          });
      } else {
        this.product = {
          name: '',
          description: '',
          type: 'single',
          price: {
            value: 0,
            quantity: {
              value: 0,
              unit: ''
            }
          },
          subproducts: []
        }
        this.buildForm(this.product);
      }
    });
  }

  onChangeSubproducts(subproducts: Subproduct[]) {
    this.product.subproducts = subproducts;
    this.calculatePrice(this.product.subproducts);

    // console.log(this.product);
  }

  onSave() {
    if(this.form.valid) {
      this.product.type = this.form.value.type;
      this.product.name = this.form.value.name;
      this.product.description = this.form.value.description;

      const product: Product = _.cloneDeep(this.product);
      const subproducts = <Subproduct[]>product.subproducts;

      product.subproducts = subproducts.map(subproduct => {
        return {
          quantity: {
            value: +subproduct.quantity.value,
            unit: subproduct.quantity.unit
          },
          product: subproduct.product._id
        };
      });

      console.log(product);

      if(product._id) {
        this.productService.put(product._id, _.omit(product, ['_id', 'price']))
          .subscribe(product => this.product = product);

        return;
      }

      this.productService.post(_.omit(product, ['_id', 'price']))
        .subscribe(product => this.product = product);
    }

  }

  private calculatePrice(subproducts: Subproduct[]) {
    const subproductsWithId = subproducts.map(subproduct => {
      return {
        quantity: subproduct.quantity,
        product: typeof subproduct.product === 'string' ? subproduct.product : subproduct.product._id
      };
    });

    this.productService.calculatePrice(subproductsWithId)
      .subscribe(({price}: {price: number}) => {
        this.price = price;
      });
  }

  private buildForm(product: Product) {
    this.form = this.fb.group({
      name: [product.name, Validators.required],
      description: [product.description],
      type: [product.type, Validators.required]
    });
  }

}