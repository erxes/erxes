import { SelectWithSearch } from '@erxes/ui/src'
import { IProduct } from '@erxes/ui-products/src/types'
import { IOption } from '@erxes/ui/src/types'
import React from 'react'
import {queries} from './graphql'
type Props = {
    onSelect:(values: string[] | string, name: string) => void
    value: string
}
class Test extends React.Component<Props> {
    constructor(props){
        super(props)
    }
    render() {

        const {value,onSelect} = this.props

        function generateProductOptions(array: IProduct[] = []): IOption[] {
          return array.map(item => {
            const product = item || ({} as IProduct);

            return {
              value: product._id,
              label: `${product.code} - ${product.name}`
            };
          });
        }

        return (
          <SelectWithSearch
            label="Choose Assets"
            name="asset"
            onSelect={onSelect}
            initialValue={value}
            queryName="products"
            customQuery={queries.products}
            generateOptions={generateProductOptions}
          />
        );
    }
}

export default Test