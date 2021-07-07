import { Component, Input, OnInit } from '@angular/core';
import { Nav, NavParams } from 'ionic-angular';
import _ from 'lodash';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';
import { BlocksProvider } from '../../providers/blocks/blocks';
import { CurrencyProvider } from '../../providers/currency/currency';
import { RedirProvider } from '../../providers/redir/redir';
import {
  ApiCoin,
  TxsProvider
} from '../../providers/transactions/transactions';

/**
 * Generated class for the TransactionDetailsComponent component.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/ComponentMetadata-class.html
 * for more info on Angular Components.
 */
@Component({
  selector: 'transaction-details',
  templateUrl: 'transaction-details.html'
})
export class TransactionDetailsComponent implements OnInit {
  public expanded = false;
  @Input()
  public tx: any = {};
  @Input()
  public showCoins = true;
  @Input()
  public chainNetwork: ChainNetwork;
  public confirmations;
  @Input()
  public page: string;

  private COIN = 100000000;
  private DEFAULT_RBF_SEQNUMBER = 0xffffffff;

  constructor(
    public currencyProvider: CurrencyProvider,
    public apiProvider: ApiProvider,
    public txProvider: TxsProvider,
    public redirProvider: RedirProvider,
    public blocksProvider: BlocksProvider,
    public nav: Nav,
    public navParams: NavParams
  ) {}

  public ngOnInit(): void {
    this.getConfirmations();
    if (this.chainNetwork.chain !== 'ETH') {
      if (!this.tx.vin || !this.tx.vin.length) {
        this.getCoins();
        this.getElysium();
      }
    }
  }

  public getElysium(): void {
    this.txProvider
        .getTx(this.tx.txid, this.chainNetwork)
        .subscribe(tx => {
          this.tx.elysium = tx.elysium;
        })
  }

  public getCoins(): void {
    this.txProvider
      .getCoins(this.tx.txid, this.chainNetwork)
      .subscribe(data => {
        this.tx.vin = data.inputs;
        this.tx.vout = data.outputs;
        this.tx.fee = this.txProvider.getFee(this.tx);
        this.tx.isRBF = _.some(data.inputs, input => {
          return (
            input.sequenceNumber &&
            input.sequenceNumber < this.DEFAULT_RBF_SEQNUMBER - 1
          );
        });
        this.tx.hasUnconfirmedInputs = _.some(data.inputs, input => {
          return input.mintHeight < 0;
        });
        this.tx.valueOut = data.outputs.reduce((a, b) => a + b.value, 0);
      });
  }

  public getAddress(v: ApiCoin): string {
    if (v.address === 'false') {
      return 'Unparsed address';
    } else if (this.tx.elysium && !this.tx.elysium.valid) {
      return 'Invalid Elysium Transaction';
    } else if (v.address === 'Elysium' && this.tx.elysium) {
      switch (this.tx.elysium.type) {
        case 'Lelantus Mint':
          return 'Mint';
        case 'Lelantus JoinSplit':
        case 'Simple Send':
          return this.tx.elysium.referenceaddress;
        case 'Create Property - Fixed':
        case 'Create Property - Manual':
          return this.tx.elysium.sendingaddress;
        default:
          return 'Elysium Transaction';
      }
    } else {
      return v.address;
    }
  }

  public getAmount(v: ApiCoin): string {
    if (v.address === 'Lelantusjmint') {
      return 'Hidden';
    } else if (v.address === 'Elysium' && this.tx.elysium && this.tx.elysium.valid) {
      const amount = this.tx.elysium.divisible ? this.tx.elysium.amount : this.tx.elysium.amount * 1e8;
      const currencySymbol = `ℙ${this.tx.elysium.propertyid}`;
      return `${this.currencyProvider.roundFloat(amount, 8)} ${currencySymbol}`;
    } else {
      return `${this.currencyProvider.getConvertedNumber(v.value, this.chainNetwork.chain)} ${this.currencyProvider.currencySymbol}`;
    }
  }

  public getConfirmations() {
    this.txProvider
      .getConfirmations(this.tx.blockheight, this.chainNetwork)
      .subscribe(confirmations => {
        this.confirmations = confirmations;
      });
  }

  public goToTx(txId: string, vout?: number, fromVout?: boolean): void {
    this.redirProvider.redir('transaction', {
      txId,
      chain: this.chainNetwork.chain,
      network: this.chainNetwork.network,
      vout,
      fromVout,
      prevPage: 'transaction-details'
    });
  }

  public goToAddress(addrStr: string): void {
    this.redirProvider.redir('address', {
      addrStr,
      chain: this.chainNetwork.chain,
      network: this.chainNetwork.network
    });
  }

  public toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  public aggregateItems(items: any[]): any[] {
    if (!items) {
      return [];
    }

    const l: number = items.length;

    const ret: any[] = [];
    const tmp: any = {};
    let u = 0;

    for (let i = 0; i < l; i++) {
      let notAddr = false;
      // non standard input
      if (items[i].scriptSig && !items[i].address) {
        items[i].address = 'Unparsed address [' + u++ + ']';
        items[i].notAddr = true;
        notAddr = true;
      }

      // non standard output
      if (items[i].scriptPubKey && !items[i].scriptPubKey.addresses) {
        items[i].scriptPubKey.addresses = ['Unparsed address [' + u++ + ']'];
        items[i].notAddr = true;
        notAddr = true;
      }

      // multiple addr at output
      if (items[i].scriptPubKey && items[i].scriptPubKey.addresses.length > 1) {
        items[i].address = items[i].scriptPubKey.addresses.join(',');
        ret.push(items[i]);
        continue;
      }

      let address: string =
        items[i].address ||
        (items[i].scriptPubKey && items[i].scriptPubKey.addresses[0]);
      const originalAddress: string = address;
      if (address === "Sigmaspend" && this.expanded) {
        address += "_" + i;
      }

      if (!tmp[address]) {
        tmp[address] = {};
        tmp[address].valueSat = 0;
        tmp[address].count = 0;
        tmp[address].address = originalAddress;
        tmp[address].items = [];
      }
      tmp[address].isSpent = items[i].spentTxId;

      tmp[address].doubleSpentTxID =
        tmp[address].doubleSpentTxID || items[i].doubleSpentTxID;
      tmp[address].doubleSpentIndex =
        tmp[address].doubleSpentIndex || items[i].doubleSpentIndex;
      tmp[address].dbError = tmp[address].dbError || items[i].dbError;
      tmp[address].valueSat += Math.round(items[i].value * this.COIN);
      tmp[address].items.push(items[i]);
      tmp[address].notAddr = notAddr;

      if (items[i].unconfirmedInput) {
        tmp[address].unconfirmedInput = true;
      }

      tmp[address].count++;
    }

    for (const v of Object.keys(tmp)) {
      const obj: any = tmp[v];
      obj.value = obj.value || parseInt(obj.valueSat, 10) / this.COIN;
      ret.push(obj);
    }

    return ret;
  }
}
