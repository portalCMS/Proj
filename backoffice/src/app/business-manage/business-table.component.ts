/**
 * Created by Administrator on 2017/4/6 0006.
 */
import {Component, EventEmitter, Input, Output, ViewChild, ViewContainerRef} from '@angular/core';
import {UserBusiness} from '../model/userbusiness';
import {CtrlBalanceModel} from './ctrl-balance.model';
import {ModalDirective} from 'ng2-bootstrap';
import {CustomHttp} from '../components/customhttp';
import {ToasterService} from 'angular2-toaster';
import {ConfirmationService, Message, TreeNode} from 'primeng/primeng';
import {CreateBuModel} from './create-bu.model';
import {TranslateService} from '@ngx-translate/core';
import {Common} from '../common/common';
import {isUndefined} from 'util';
import {AccountService} from "../account/account.service";
import {CommonUtil} from "../common/CommonUtil";

@Component({
  selector: 'business-table',
  templateUrl: './business-table.component.html',
  styleUrls: ['./business-table.component.scss']
})

export class BusinessTableComponent {
  private host = Common.URL;
  private BU_URL = this.host + '/merchantUser/';
  public AGENT_URL = this.host + '/agentFunction/';
  @Input() public userBusinessList: UserBusiness[] = [];
  @Input() public parentModel: UserBusiness ;
  @Input() public path: string = '/';

  @Output() onExpend = new EventEmitter<{}>();
  @Output() onClose = new EventEmitter<BusinessTableComponent>();
  @Output() onHandle = new EventEmitter<{}>();

  private ctrlBalanceModel: CtrlBalanceModel = new CtrlBalanceModel();
  @ViewChild('ctrlBalance')
  private ctrlBalanceModal: ModalDirective;

  @ViewChild('createSysBu')
  private createSysBuDialog: ModalDirective;

  private createBuModel: CreateBuModel = new CreateBuModel();

  transferType: any[] =[];

  private languageList = [{'name': 'ko_kr', 'value': 'ko_kr'},
    {'name': 'en_us', 'value': 'en_us'},
    {'name': 'zh_tw', 'value': 'zh_tw'},
    {'name': 'zh_cn', 'value': 'zh_cn'}];
  private msgs: Message[] = [];
  private limitRedData = {'data': []};
  private selectLimitRedData: TreeNode[] = [];

  private initBalanceFlag: boolean = false;
  private merchantPrefixReadonlyFlag: boolean = false;

  // 当前登录用户
  currentUser: any;

  constructor(public viewContainerRef: ViewContainerRef, private http: CustomHttp,
              private toaster: ToasterService,private accountService:AccountService, private confirmDialog: ConfirmationService,
              private _translate: TranslateService){
  }

  ngOnInit() {
    const user = JSON.parse(localStorage.getItem('loginUser'));
    this.currentUser = user.user;

    this.initData();
  }

  expend(userBusiness: UserBusiness) {
    this.onExpend.emit({'model': userBusiness, 'component': this});
  }

  initData(){
    this.transferType.push({'name':this._translate.instant("common.in"),'value':'1'});
    this.transferType.push({'name':this._translate.instant("common.out"),'value':'2'});
  }

  close() {
    this.onClose.emit(this);
  }

  public handle(type: number, userBusiness : UserBusiness){
    this.onHandle.emit({'type': type, 'model': userBusiness, 'component': this});
  }

  initCtrlBalanceDialog(item: any) {
    this.ctrlBalanceModel = new CtrlBalanceModel();
    this.ctrlBalanceModel.id = item.id;
    this.ctrlBalanceModel.parentId = item.parentId;
    this.ctrlBalanceModel.userType = item.userType;
    this.ctrlBalanceModel.currBalance = item.balance;
    this.ctrlBalanceModal.show();
  }

  public initCreateBuDialog(item: UserBusiness) {
    const condition = {
      id: item.id
    };
    this.accountService.getUserByUid({
      id: item.id
    }).subscribe(
      rc => {
        this.createBuModel = new CreateBuModel();
        this.createBuModel.parentId = item.id;
        this.createBuModel.agentHoldMaxPercent=CommonUtil.forDight(rc.data.intoPercentage * 100, 2);
      },
      err => {
        console.log(err);
      });
    return this.http.post(this.BU_URL + 'getChips', condition)
      .map(res => res.json())
      .subscribe(res => {
        const nodes = [];
        this.limitRedData.data = this.convertObjs(res.data);
        this.initBalanceFlag = true;
        this.merchantPrefixReadonlyFlag = false;
        this.createSysBuDialog.show();
      });
  }
  initEditBuDialog(item: any) {
    let condition;
    if (isUndefined(this.parentModel)) {
      condition = {
        id: item.parentId==null?item.id:item.parentId
      };
    } else {
      condition = {
        id: this.parentModel.id
      };
    }
    this.accountService.getUserByUid({
      id: item.parentId
    }).subscribe(
      rc => {
        this.createBuModel = new CreateBuModel();
        this.createBuModel.agentHoldMaxPercent=CommonUtil.forDight(rc.data.intoPercentage * 100, 2);
      },
      err => {
        console.log(err);
      });
    return this.http.post(this.BU_URL + 'getChips', condition)
      .map(res => res.json())
      .subscribe(res => {
        this.initBalanceFlag = false;
        this.merchantPrefixReadonlyFlag = true;
        this.createBuModel.id = item.id;
        this.createBuModel.merchantPrefix = item.merchantPrefix;
        this.createBuModel.remark = item.remark;
        this.createBuModel.userType = item.userType;
        this.createBuModel.allowIpList = item.allowIpList;
        // this.createBuModel.language = item.language;
        // this.createBuModel.maxDepositLimit = item.maxdepositlimit;
        this.createBuModel.returnURL = item.returnurl;
        // this.createBuModel.useBalance = item.balance;
        if(item.intoPercentage ==null || isUndefined(item.intoPercentage)){
          this.createBuModel.oldIntoPercentage =null;
        }else{
          this.createBuModel.oldIntoPercentage = item.intoPercentage*100;
        }
        this.createBuModel.type = item.type;
        this.createBuModel.merchantType = item.merchantType;
        this.createBuModel.number = item.number;
        if (item.chips) {
          this.createBuModel.chips = item.chips.split(',');
        }
        this.selectLimitRedData = [];

        this.limitRedData.data = this.convertObjs(res.data, this.createBuModel.chips);
        this.createSysBuDialog.show();
        // this.selectedFiles2.push(this.limitRedData.data[0].children[2]);

      });
  }

  convertObjs(res, selectDatas?: string[]) {
    const nodes = [];
    res[0].text=this._translate.instant("common.root");
    for (const item of res){
      nodes.push(this.convertObj(item, selectDatas));
    }
    return nodes;
  }

  convertObj(item, selectDatas ?: string[]): TreeNode {
    const node: TreeNode = {label: item['text'], data: item['id'], expanded: true, children: []};
    if (selectDatas && selectDatas.indexOf(node.data + '') >= 0) {
      this.selectLimitRedData.push(node);
    }
    if (item['children']) {
      for (const child of item['children']){
        let label = '';
        if(child.type ==1){
          label += this._translate.instant("common.baccarat");
        }else{
          label += this._translate.instant("common.roulette");
        }
        label +=this._translate.instant("common.max")+":"+child.max+" "+this._translate.instant("common.min")+":"+child.min +" "
          +this._translate.instant("common.chips")+":"+child.chips;
        child['text'] = label;
        node.children.push(this.convertObj(child, selectDatas));
      }
    }
    return node;
  }

  save() {
    if (this.createBuModel.number) {
      this.updateBu();
    } else {
      this.createBu();
    }
  }

  updateBu() {
    this.createBuModel.chips = '';
    this.selectLimitRedData.forEach(item => {
      this.createBuModel.chips += item.data + ',';
    });
    if (this.createBuModel.chips === '') {
      this.toaster.pop('error', this._translate.instant('common.warning'), this._translate.instant('subaccount.chipsillegal'));
      return false;
    }
    // this.createBuModel.isAddBu = this.createBuModel.type === '1';

    this.http.post(this.BU_URL + 'update', this.createBuModel)
      .map(res => res.json())
      .subscribe(r => {
        if (r.status === 0) {
          this.showSuccess(r.msg);
          this.searchChild();
          this.createSysBuDialog.hide();
        } else {
          this.showError(r.msg);
        }
      });
  }


  createBu() {
    this.createBuModel.chips = '';
    this.selectLimitRedData.forEach(item => {
      this.createBuModel.chips += item.data + ',';
    });
    if (this.createBuModel.chips === '') {
      this.toaster.pop('error', this._translate.instant('common.warning'), this._translate.instant('subaccount.chipsillegal'));
      return false;
    }
    if (Number(this.createBuModel.intoPercentage) >  Number(this.createBuModel.agentHoldMaxPercent)) {
      this.toaster.pop('error', this._translate.instant('common.warning'),
        this._translate.instant('account.realHoldNoMoreThan') + this.createBuModel.agentHoldMaxPercent);
      return false;
    }
    this.createBuModel.chips=","+this.createBuModel.chips;
    this.http.post(this.BU_URL + 'create', this.createBuModel)
      .map(res => res.json())
      .subscribe(r => {
        if (r.status === 0) {
          this.showSuccess(r.msg);
          // this.searchChild();
          this.onHandle.emit({'type': 2, 'model': this.createBuModel});
          this.createSysBuDialog.hide();
        }else {
          // this.toaster.pop('error', '错误', r.msg+'');
          this.showError(r.msg);
        }
      });
  }

  modifyCtrlBalance() {
    this.http.post(this.BU_URL + 'modifyBalance', this.ctrlBalanceModel)
      .map(res => res.json())
      .subscribe(r => {
        if (r.status === 0) {
          // this.search();
          this.showSuccess(r.msg);
          this.searchChild();
          this.ctrlBalanceModal.hide();
        }else {
          // this.toaster.pop('error', '错误', r.msg+'');
          this.showError(r.msg);
        }
      });
  }

  searchChild() {
    if (isUndefined(this.parentModel)) {
      this.onHandle.emit({'type': 1})
      return;
    }
    this.http.post(this.BU_URL + 'search', {
      'parentId': this.parentModel.id
    })
      .map(res => res.json())
      .subscribe(
        p => {
          this.userBusinessList = [];
          const temps = p['data'];
          if (temps) {
            for (let i = 0; i < temps.length; i++) {
              const item = temps[i];
              this.userBusinessList.push(item);
            }
          }
        }
      );
  }

  changeStatus(userBusiness: any, status: number) {
    const msg = status === 1 ?
      this._translate.instant('businessManager.confirmEnableMerchant') :
      this._translate.instant('businessManager.confirmDisableMerchant');
    this.confirmDialog.confirm({
      message: msg,
      accept: () => {
        this.http.post(this.BU_URL + 'modifyStatus', {
          'id': userBusiness.id,
          'type': userBusiness.type,
          'source': userBusiness.source,
          'status': status
        })
          .map(res => res.json())
          .subscribe(
            p => {
              if (p.status === 0) {
                this.showSuccess(p.msg);
                this.searchChild();
              }else{
                this.showError(p.msg);
              }
            }
          );
      }
    });
  }

  showError(msg: string) {
    this.msgs = [];
    // this.msgs.push({severity:'error', summary: this._translate.instant('common.opeator.fail') , detail:msg});
    this.toaster.pop('error', this._translate.instant('common.error'), msg);
  }
  showSuccess(msg: string) {
    this.msgs = [];
    // this.msgs.push({severity:'success', summary: this._translate.instant('common.opeator.success') , detail:msg});
    this.toaster.pop('success', this._translate.instant('common.success'), msg);
  }
}
