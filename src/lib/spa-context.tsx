import {createContext,useContext,useState,useEffect,type ReactNode} from 'react';
import {seedData,managers,branchVisits,type SpaData,type Manager,type Visit,type Customer} from './spa-model';
interface SpaContextValue { data:SpaData;manager:Manager|null;ready:boolean;login:(username:string,password:string,remember:boolean)=>boolean;logout:()=>void;visits:Visit[];customers:Customer[];updateVisit:(visit:Visit)=>void;createVisit:(visit:Visit,customer:Customer)=>void;activity:(text:string)=>void }
const SpaContext=createContext<SpaContextValue|null>(null);
export function SpaProvider({children}:{children:ReactNode}){ const [data,setData]=useState<SpaData>(()=>seedData());const [manager,setManager]=useState<Manager|null>(null);const [ready,setReady]=useState(false);
useEffect(()=>{try{const saved=localStorage.getItem('bode-spa-data-v1');if(saved)setData(JSON.parse(saved));const id=sessionStorage.getItem('bode-manager')||localStorage.getItem('bode-manager');setManager(managers.find(m=>m.id===id)??null);}catch{localStorage.removeItem('bode-spa-data-v1');}setReady(true);},[]);
useEffect(()=>{if(ready)localStorage.setItem('bode-spa-data-v1',JSON.stringify(data));},[data,ready]);
const login=(username:string,password:string,remember:boolean)=>{const m=managers.find(m=>m.username===username&&m.password===password);if(!m)return false;setManager(m);sessionStorage.setItem('bode-manager',m.id);if(remember)localStorage.setItem('bode-manager',m.id);else localStorage.removeItem('bode-manager');return true;};
const logout=()=>{setManager(null);sessionStorage.removeItem('bode-manager');localStorage.removeItem('bode-manager');};
const activity=(text:string)=>{if(!manager)return;setData(d=>({...d,activity:[{id:crypto.randomUUID(),branchId:manager.branchId,text,time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})},...d.activity]}));};
const updateVisit=(visit:Visit)=>{if(!manager||visit.branchId!==manager.branchId)return;setData(d=>({...d,visits:d.visits.map(v=>v.id===visit.id&&v.branchId===manager.branchId?visit:v)}));};
const createVisit=(visit:Visit,customer:Customer)=>{if(!manager||visit.branchId!==manager.branchId||customer.branchId!==manager.branchId)return;setData(d=>({...d,customers:d.customers.some(c=>c.id===customer.id)?d.customers:[...d.customers,customer],visits:[...d.visits,visit]}));};
return <SpaContext.Provider value={{data,manager,ready,login,logout,visits:manager?branchVisits(data,manager.branchId):[],customers:manager?data.customers.filter(c=>c.branchId===manager.branchId):[],updateVisit,createVisit,activity}}>{children}</SpaContext.Provider>;
}
export function useSpa(){const context=useContext(SpaContext);if(!context)throw new Error('Spa provider missing');return context;}
