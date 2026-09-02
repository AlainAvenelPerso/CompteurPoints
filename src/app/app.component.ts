import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Player } from './player.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  newPlayer='';
  sortOrder:'asc'|'desc'='desc';
  players:Player[]=[];
  editingId:number|null=null;
  editingName='';
  scoreEditId:number|null=null;
  scoreInput:number|null=null;
  scoreMode:'add'|'sub'|'set'='add';
  showClearConfirmation=false;
  private defaultColors=['#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f','#edc948','#b07aa1','#ff9da7','#9c755f','#bab0ac'];
  private colorIndex=0;
  private scoreHistory:Map<number,number[]>=new Map();
  changelog:{playerName:string;color:string;before:number;after:number;date:Date}[]=[];
  get maxLog():number{ return this.players.length*2; }
  get recentLog(){ return this.changelog.slice(-this.maxLog).reverse(); }
  addPlayer(){ if(!this.newPlayer.trim()) return; const color=this.defaultColors[this.colorIndex%this.defaultColors.length]; this.colorIndex++; const id=Date.now(); this.players.push({id,name:this.newPlayer,score:0,delta:1,color}); this.scoreHistory.set(id,[]); this.newPlayer=''; this.sortPlayers(); }
  deletePlayer(id:number){ this.players=this.players.filter(p=>p.id!==id); this.scoreHistory.delete(id); this.editingId=null; }
  openClearConfirmation(){ this.showClearConfirmation=true; }
  closeClearConfirmation(){ this.showClearConfirmation=false; }
  confirmClearPlayers(){ this.clearPlayers(); this.closeClearConfirmation(); }
  clearPlayers(){ this.players=[]; this.scoreHistory.clear(); this.changelog=[]; }
  addPoints(p:Player){ this.pushHistory(p); const before=p.score; p.score+=Number(p.delta); this.addLog(p,before,p.score); this.sortPlayers(); }
  removePoints(p:Player){ this.pushHistory(p); const before=p.score; p.score-=Number(p.delta); this.addLog(p,before,p.score); this.sortPlayers(); }
  canUndo(p:Player):boolean{ return (this.scoreHistory.get(p.id)?.length??0)>0; }
  undoScore(p:Player){ const hist=this.scoreHistory.get(p.id); if(hist&&hist.length>0){ const before=p.score; p.score=hist.pop()!; this.addLog(p,before,p.score); this.sortPlayers(); } }
  private pushHistory(p:Player){ const hist=this.scoreHistory.get(p.id)??[]; hist.push(p.score); this.scoreHistory.set(p.id,hist); }
  private addLog(p:Player,before:number,after:number){ this.changelog.push({playerName:p.name,color:p.color,before,after,date:new Date()}); }
  toggleSort(){ this.sortOrder=this.sortOrder==='asc'?'desc':'asc'; this.sortPlayers(); }
  startEdit(p:Player){ this.editingId=p.id; this.editingName=p.name; }
  confirmEdit(p:Player){ if(this.editingName.trim()) p.name=this.editingName.trim(); this.editingId=null; }
  cancelEdit(){ this.editingId=null; }
  openScoreEdit(p:Player){ this.scoreEditId=p.id; this.scoreInput=null; this.scoreMode='add'; }
  closeScoreEdit(){ this.scoreEditId=null; }
  get previewScore():number{ const p=this.players.find(x=>x.id===this.scoreEditId); if(!p) return 0; const val=Number(this.scoreInput??0); if(this.scoreMode==='add') return p.score+val; if(this.scoreMode==='sub') return p.score-val; return val; }
  confirmScoreEdit(){ const p=this.players.find(x=>x.id===this.scoreEditId); if(!p) return; const before=p.score; this.pushHistory(p); p.score=this.previewScore; this.addLog(p,before,p.score); this.sortPlayers(); this.scoreEditId=null; }
  private sortPlayers(){ this.players.sort((a,b)=>this.sortOrder==='asc'?a.score-b.score:b.score-a.score); }
}
