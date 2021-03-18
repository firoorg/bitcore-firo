import { Component, Injectable } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';
import { CurrencyProvider } from '../../providers/currency/currency';
import { FiroProvider, FiroStatusResult } from '../../providers/firo/firo';
import { PriceProvider } from '../../providers/price/price';
import { RedirProvider } from '../../providers/redir/redir';

@Injectable()
@IonicPage({
  name: 'firo-status',
  segment: ':chain/:network/firo-status',
  defaultHistory: ['home']
})
@Component({
  selector: 'page-firo-status',
  templateUrl: 'firo-status.html'
})
export class FiroStatusPage {
  public loading = true;
  public confirmations: number;
  public errorMessage: string;
  public chainNetwork: ChainNetwork;
  public status: FiroStatusResult;
  public syncPercent: number;

  constructor(
    public navParams: NavParams,
    public currencyProvider: CurrencyProvider,
    public redirProvider: RedirProvider,
    private apiProvider: ApiProvider,
    private priceProvider: PriceProvider,
    private firoProvider: FiroProvider
  ) {
    const chain: string = navParams.get('chain');
    const network: string = navParams.get('network');

    this.chainNetwork = {
      chain,
      network
    };
    this.apiProvider.changeNetwork(this.chainNetwork);
    this.currencyProvider.setCurrency(this.chainNetwork);
    this.priceProvider.setCurrency();
  }

  public ionViewDidEnter(): void {
    this.firoProvider.getFiroStatus(this.chainNetwork)
      .subscribe(status => {
        this.loading = false;
        this.status = status;
        this.syncPercent = Math.round(100 * status.blockchainInfo.verificationprogress);
      }, error => {
        this.loading = false;
        this.errorMessage = error;
      });
  }

  public goToBlock(blockId: any): void {
    this.redirProvider.redir('block-detail', {
      blockHash: blockId,
      chain: this.chainNetwork.chain,
      network: this.chainNetwork.network
    });
  }
}
