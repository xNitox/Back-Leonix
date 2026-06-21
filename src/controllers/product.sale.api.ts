

import type { ProductsSaleProps } from '../interface/product.sale.ts';
import type { Request, Response } from "express";


export const getProductsSale = (_req: Request, res: Response) => {
    const products: ProductsSaleProps[] = [
        {
            codigo: 10,
            nombreProducto: 'Pan',
            cantidad: 2,
            precio: 5,
            ahorro: 1,
        }
    ];
    res.json(products);
};
