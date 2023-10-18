import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';
import { CurrencyProvider } from '../../providers/currency/currency';
import { BlocksProvider } from '../blocks/blocks';
import { ApiCoin, ApiEthCoin, TxsProvider } from '../transactions/transactions';

export interface ApiAddr {
  confirmed: number;
  unconfirmed: number;
  balance: number;
}

@Injectable()
export class AddressProvider {
  constructor(
    public httpClient: HttpClient,
    public currency: CurrencyProvider,
    public blocks: BlocksProvider,
    public txsProvider: TxsProvider,
    private apiProvider: ApiProvider
  ) {}

  public getAddressBalance(
    addrStr?: string,
    chainNetwork?: ChainNetwork
  ): Observable<ApiAddr> {
    switch (addrStr) {
      case "Lelantus":
        return Observable.forkJoin<ApiAddr>([
          this.httpClient.get<ApiAddr>(
            `${this.apiProvider.getUrl(chainNetwork)}/address/${addrStr}mint/balance`
          ),
          this.httpClient.get<ApiAddr>(
            `${this.apiProvider.getUrl(chainNetwork)}/address/${addrStr}jsplit/balance`
          )
        ]).map(results => {
          return {
            confirmed: results[0].confirmed + results[1].confirmed,
            unconfirmed: results[0].unconfirmed + results[1].unconfirmed,
            balance: results[0].balance + results[1].balance
          };
        });
      case "Spark":
        return Observable.forkJoin<ApiAddr>([
          this.httpClient.get<ApiAddr>(
            `${this.apiProvider.getUrl(chainNetwork)}/address/${addrStr}mint/balance`
          ),
          this.httpClient.get<ApiAddr>(
            `${this.apiProvider.getUrl(chainNetwork)}/address/${addrStr}spend/balance`
          )
        ]).map(results => {
          return {
            confirmed: results[0].confirmed + results[1].confirmed,
            unconfirmed: results[0].unconfirmed + results[1].unconfirmed,
            balance: results[0].balance + results[1].balance
          };
        });
      case "Sigma":
        return Observable.forkJoin<ApiAddr>([
          this.httpClient.get<ApiAddr>(
            `${this.apiProvider.getUrl(chainNetwork)}/address/${addrStr}mint/balance`
          ),
          this.httpClient.get<ApiAddr>(
            `${this.apiProvider.getUrl(chainNetwork)}/address/${addrStr}spend/balance`
          )
        ]).map(results => {
          return {
            confirmed: results[0].confirmed + results[1].confirmed,
            unconfirmed: results[0].unconfirmed + results[1].unconfirmed,
            balance: results[0].balance + results[1].balance
          };
        });
      default:
        return this.httpClient.get<ApiAddr>(
          `${this.apiProvider.getUrl(chainNetwork)}/address/${addrStr}/balance`
        );
    }
  }

  public getAddressActivity(
    addrStr?: string,
    chainNetwork?: ChainNetwork
  ): Observable<ApiCoin[] & ApiEthCoin[]> {
    switch (addrStr) {
      case "Lelantus":
        return Observable.forkJoin<ApiCoin[] & ApiEthCoin[]>([
          this.httpClient.get<ApiCoin[] & ApiEthCoin[]>(
            `${this.apiProvider.getUrl(
              chainNetwork
            )}/address/${addrStr}mint/txs?limit=1000000`
          ),
          this.httpClient.get<ApiCoin[] & ApiEthCoin[]>(
            `${this.apiProvider.getUrl(
              chainNetwork
            )}/address/${addrStr}jmint/txs?limit=1000000`
          ),
          this.httpClient.get<ApiCoin[] & ApiEthCoin[]>(
            `${this.apiProvider.getUrl(
              chainNetwork
            )}/address/${addrStr}jsplit/txs?limit=1000000`
          )
        ]).map(results => {
          return [ ...results[0], ...results[1], ...results[2] ];
        });
      case "Spark":
        return Observable.forkJoin<ApiCoin[] & ApiEthCoin[]>([
          this.httpClient.get<ApiCoin[] & ApiEthCoin[]>(
            `${this.apiProvider.getUrl(
              chainNetwork
            )}/address/${addrStr}mint/txs?limit=1000000`
          ),
          this.httpClient.get<ApiCoin[] & ApiEthCoin[]>(
            `${this.apiProvider.getUrl(
              chainNetwork
            )}/address/${addrStr}smint/txs?limit=1000000`
          ),
          this.httpClient.get<ApiCoin[] & ApiEthCoin[]>(
            `${this.apiProvider.getUrl(
              chainNetwork
            )}/address/${addrStr}spend/txs?limit=1000000`
          )
        ]).map(results => {
          return [ ...results[0], ...results[1], ...results[2] ];
        });
      case "Sigma":
        return Observable.forkJoin<ApiCoin[] & ApiEthCoin[]>([
          this.httpClient.get<ApiCoin[] & ApiEthCoin[]>(
            `${this.apiProvider.getUrl(
              chainNetwork
            )}/address/${addrStr}mint/txs?limit=1000000`
          ),
          this.httpClient.get<ApiCoin[] & ApiEthCoin[]>(
            `${this.apiProvider.getUrl(
              chainNetwork
            )}/address/${addrStr}spend/txs?limit=1000000`
          )
        ]).map(results => {
          return [ ...results[0], ...results[1] ];
        });
      default:
        return this.httpClient.get<ApiCoin[] & ApiEthCoin[]>(
          `${this.apiProvider.getUrl(
            chainNetwork
          )}/address/${addrStr}/txs?limit=1000000`
        );
    }
  }

  public getAddressActivityCoins(
    addrStr?: string,
    chainNetwork?: ChainNetwork
  ): Observable<any> {
    return this.httpClient.get<any>(
      `${this.apiProvider.getUrl(chainNetwork)}/address/${addrStr}/coins`
    );
  }
}
