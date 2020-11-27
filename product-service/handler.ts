import 'source-map-support/register';

import { catalogBatchProcess } from './handlers/catalogBatchProcess';
import { getProductsList } from './handlers/getProductsList';
import { getProductById } from './handlers/getProductById';


export { getProductsList, getProductById, catalogBatchProcess };