import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';

import { Exclude } from 'class-transformer';

@Entity('clients')
export default class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  external_id: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  corporate_name: string;

  @Column()
  kind_of_person: string;

  @Column()
  document: string;

  @CreateDateColumn()
  date_nasc: Date;

  @Column()
  @Exclude()
  password: string;

  @Column()
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
