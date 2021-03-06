import {Component, OnDestroy, OnInit} from "@angular/core";
import {TransRecordService} from "./transrecord.service";
import {TranslateService} from "@ngx-translate/core";
import {ToasterService} from "angular2-toaster/angular2-toaster";
import {DomSanitizer} from "@angular/platform-browser";
import {CommonUtil} from "../../common/CommonUtil";
import {SearchModel} from "app/report/transrecord/search.model";
import {Common} from "../../common/common";


@Component({
  templateUrl: 'transrecord.component.html',
  styleUrls: ['./transrecord.component.scss']
})
export class TransRecordComponent implements  OnInit,OnDestroy {
  private realTableList: any[] ;
  public totalItems: number = 0;
  public maxSize: number = Common.MAX_PAGE_SIZE;
  private searchModel : SearchModel = new SearchModel();
  public betMoney: number = 0;
  public winLostMoney: number = 0;
  public totalBetMoney: number = 0;
  public totalWinLostMoney: number = 0;

  constructor(private transRecordService:TransRecordService, private _translate:TranslateService, private toaster:ToasterService, private domSani:DomSanitizer) {
  }

  ngOnInit() {
    let obj = JSON.parse(sessionStorage.getItem("transrecord-component"));
    if(obj){
      this.searchModel = SearchModel.create(obj.searchModel);
      this.realTableList = obj.realTableList;
    }else {
      this.searchModel.startTime = CommonUtil.getStartDate();
      this.searchModel.endTime = CommonUtil.getEndDate();
    }
  }


  ngOnDestroy(): void {
    let json = {"searchModel":this.searchModel,"realTableList":this.realTableList};
    sessionStorage.setItem("transrecord-component",JSON.stringify(json));
  }

  public pageChanged(event:any):void {
    this.searchModel.currentPage = event.page;
    this.search();
  }

  public search() {
    this.transRecordService.searchReal(this.searchModel).subscribe(
      betOrder => {
        if(betOrder.data.total ==0){
          this.realTableList = [];
          this.totalItems = 0;
          this.betMoney = 0;
          this.winLostMoney = 0;
          this.totalBetMoney = 0;
          this.totalWinLostMoney = 0;
        }else{
          this.realTableList = this.dealListData(betOrder.data.data);
          this.totalItems = betOrder.data.total;
          this.betMoney = this.transRecordService.formatMoney(betOrder.data.otherInfo.betMoney, 2);
          this.winLostMoney = this.transRecordService.formatMoney(betOrder.data.otherInfo.winLostMoney, 2);
          this.totalBetMoney = this.transRecordService.formatMoney(betOrder.data.otherInfo.totalBetMoney, 2);
          this.totalWinLostMoney = this.transRecordService.formatMoney(betOrder.data.otherInfo.totalWinLostMoney, 2);
        }
      },
      err => {
        this.toaster.pop('error', this._translate.instant('common.error'), err);
      });
  }


  //toaster共用的函数
  public glaobal_toaster(response:Response) {
    let ok = response.json()['ok'] as boolean;
    let message = response.json()['msg'] as string;
    if (ok) {
      this.toaster.pop('success', this._translate.instant('common.success'), message);
    } else {
      this.toaster.pop('error', this._translate.instant('common.error'), message);
    }
  }

  private makeRoundResult(data){
    return this.transRecordService.formatter1(data);
  }

  //处理后台返回的数据
  dealListData(datas:any[]) {
    if (datas.length <= 0)
      return datas;

    for (let data of datas) {
      //处理类型
     // data.tableType = this.transRecordService.formatType(data.tableType);
      //百家乐M02桌1靴1局（VIP） 轮盘122桌764局
      if(data.gameId==3){ //轮盘
        data.gameName = data.gameTable + data.tableId + this._translate.instant('common.table') + data.roundNum + this._translate.instant('common.round');
      }else if(data.gameId==1){
        if(data.tableType==2){
          data.gameName = data.gameTable + this._translate.instant('common.table')+ data.bootsNum + this._translate.instant('common.boots') + data.roundNum + this._translate.instant('common.round')+"("+this._translate.instant('msg.d3_livevip')+")";
        }else{
          data.gameName = data.gameTable + this._translate.instant('common.table')+ data.bootsNum + this._translate.instant('common.boots') + data.roundNum + this._translate.instant('common.round');
        }
      }
    }
    return datas;
  }

}
