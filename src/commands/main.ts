import { Command } from 'commander';
// import { registerCreateTransformerCommand } from './createTransformer';
import { registerGrabTransactionCommand } from './grabTransaction';
// import { registerRunTransformersCommand } from './runTransformers';

export const program = new Command();

program
  .name('Onceupon command')
  .description('CLI to some contextualizer utils')
  .version('0.1.0');

// registerCreateTransformerCommand();
registerGrabTransactionCommand();
// registerRunTransformersCommand();

program.parse(process.argv);
