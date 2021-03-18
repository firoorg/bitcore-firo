import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChartsModule } from 'ng2-charts';
import { ErrorComponentModule } from '../../components/error/error.module';
import { FooterComponentModule } from '../../components/footer/footer.module';
import { HeadNavComponentModule } from '../../components/head-nav/head-nav.module';
import { LoaderComponentModule } from '../../components/loader/loader.module';
import { CopyToClipboardModule } from '../../directives/copy-to-clipboard/copy-to-clipboard.module';
import { FiroStatusPage } from './firo-status';

@NgModule({
  declarations: [FiroStatusPage],
  imports: [
    IonicPageModule.forChild(FiroStatusPage),
    FooterComponentModule,
    HeadNavComponentModule,
    LoaderComponentModule,
    ErrorComponentModule,
    CopyToClipboardModule,
    ChartsModule
  ],
  exports: [FiroStatusPage]
})
export class FiroStatusPageModule {}
