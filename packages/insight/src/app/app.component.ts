import { Component, ViewChild } from '@angular/core';
import { Events, Nav, Platform } from 'ionic-angular';
import { ApiProvider } from '../providers/api/api';

@Component({
  templateUrl: './app.html'
})
export class InsightApp {
  @ViewChild('content')
  public nav: Nav;

  private platform: Platform;

  private chain: string;
  private network: string;

  public rootPage: any;
  public pages: Array<{ title: string; component: any; icon: any }>;

  constructor(
    platform: Platform,
    public apiProvider: ApiProvider,
    public events: Events
  ) {
    this.platform = platform;

    this.initializeApp();
  }

  private initializeApp(): void {
    this.platform.ready().then(() => {
      this.nav.setRoot('home', {
        chain: this.apiProvider.networkSettings.selectedNetwork.chain,
        network: this.apiProvider.networkSettings.selectedNetwork.network
      });
      this.subscribeRedirEvent();
    });
  }

  public subscribeRedirEvent() {
    this.events.subscribe('redirToEvent', data => {
      let id: string = null;
      if (data.params) {
        if (data.params.txId) {
          id = data.params.txId;
        } else {
          if (data.params.blockHash) {
            id = data.params.blockHash;
          }
        }
      }
      if (id) {
        this.nav.push(data.redirTo, data.params, { id });
      } else {
        this.nav.push(data.redirTo, data.params);
      }
    });
  }
}
