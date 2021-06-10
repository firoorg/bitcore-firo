import { Component, Injectable } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';
import { CurrencyProvider } from '../../providers/currency/currency';
import { FiroProvider, LelantusStatusResult } from '../../providers/firo/firo';
import { PriceProvider } from '../../providers/price/price';
import { RedirProvider } from '../../providers/redir/redir';

@Injectable()
@IonicPage({
  name: 'lelantus-status',
  segment: ':chain/:network/lelantus-status',
  defaultHistory: ['home']
})
@Component({
  selector: 'page-lelantus-status',
  templateUrl: 'lelantus-status.html'
})
export class LelantusStatusPage {
  public loading = true;
  public confirmations: number;
  public errorMessage: string;
  public chainNetwork: ChainNetwork;
  public status: LelantusStatusResult;
  public sigmaDenoms: number[] = [];
  public chartOptions = {
    responsive: true,
    scales : {
      yAxes : [ {
        type: 'logarithmic'
      } ]
    },
    tooltips: { mode: "index" }
  };
  public chartLabels = [];
  public chartData = [
    { data: [], label: 'Mints' },
    { data: [], label: 'Splits' }
  ];
  public chartColors = [
    { borderColor: '#33cc33', backgroundColor: '#33cc3340', borderWidth: 2 },
    { borderColor: '#9b1c2e', backgroundColor: '#9b1c2e40', borderWidth: 2 }
  ];
  public showChartLegend = false;

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
    this.firoProvider.getLelantusStatus(this.chainNetwork)
      .subscribe(status => {
        this.loading = false;
        this.status = status;
        Object.keys(status.sigmaMint).forEach(denom => {
          this.sigmaDenoms.push(Number(denom) / 100000000);
        });
        this.sigmaDenoms.sort((a, b) => b - a);
        const allKeys = {};
        Object.keys(status.lelantusMint).forEach(key => {
          if (status.lelantusMint[key].value > 0) {
            allKeys[key] = null;
          }
        });
        Object.keys(status.lelantusSplit).forEach(key => {
          if (status.lelantusSplit[key].value > 0) {
            allKeys[key] = null;
          }
        });
        const allKeysArray = Object.keys(allKeys);
        allKeysArray.sort((key1, key2) => {
          const parts1 = key1.split('_');
          const parts2 = key2.split('_');
          return Number(parts1[0]) + Number(parts1[1]) - Number(parts2[0]) - Number(parts2[1]);
        });
        allKeysArray.forEach(key => {
          const parts = key.split('_');
          this.chartLabels.push('' + ((Number(parts[0]) + Number(parts[1])) / 2));
          const mintInfo = status.lelantusMint[key];
          const splitInfo = status.lelantusSplit[key];
          this.chartData[0].data.push(mintInfo ? mintInfo.value / 100000000 : 0);
          this.chartData[1].data.push(splitInfo ? splitInfo.value / 100000000 : 0);
        });
      }, error => {
        this.loading = false;
        this.errorMessage = error;
      });
  }
}
