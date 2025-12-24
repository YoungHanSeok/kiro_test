/**
 * JSON 파일 기반 데이터 저장소 유틸리티
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * JSON 저장소 클래스
 * 파일 시스템을 이용한 간단한 JSON 데이터 저장소
 */
export class JsonStorage<T> {
  private filePath: string;

  constructor(fileName: string) {
    this.filePath = path.join(__dirname, '../data', fileName);
  }

  /**
   * 데이터 읽기
   */
  async read(): Promise<T[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // 파일이 없으면 빈 배열 반환
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw new Error(`JSON 파일 읽기 실패: ${error}`);
    }
  }

  /**
   * 데이터 쓰기
   */
  async write(data: T[]): Promise<void> {
    try {
      // 디렉토리가 없으면 생성
      const dir = path.dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // 데이터를 JSON 형식으로 저장
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`JSON 파일 쓰기 실패: ${error}`);
    }
  }

  /**
   * 단일 항목 추가
   */
  async add(item: T): Promise<void> {
    const data = await this.read();
    data.push(item);
    await this.write(data);
  }

  /**
   * 조건에 맞는 항목 찾기
   */
  async find(predicate: (item: T) => boolean): Promise<T | undefined> {
    const data = await this.read();
    return data.find(predicate);
  }

  /**
   * 조건에 맞는 모든 항목 찾기
   */
  async findAll(predicate?: (item: T) => boolean): Promise<T[]> {
    const data = await this.read();
    return predicate ? data.filter(predicate) : data;
  }

  /**
   * 조건에 맞는 항목 업데이트
   */
  async update(predicate: (item: T) => boolean, updater: (item: T) => T): Promise<boolean> {
    const data = await this.read();
    const index = data.findIndex(predicate);
    
    if (index === -1) {
      return false;
    }
    
    data[index] = updater(data[index]);
    await this.write(data);
    return true;
  }

  /**
   * 조건에 맞는 항목 삭제
   */
  async delete(predicate: (item: T) => boolean): Promise<boolean> {
    const data = await this.read();
    const initialLength = data.length;
    const filteredData = data.filter(item => !predicate(item));
    
    if (filteredData.length === initialLength) {
      return false;
    }
    
    await this.write(filteredData);
    return true;
  }

  /**
   * 전체 데이터 개수
   */
  async count(predicate?: (item: T) => boolean): Promise<number> {
    const data = await this.read();
    return predicate ? data.filter(predicate).length : data.length;
  }

  /**
   * 데이터 존재 여부 확인
   */
  async exists(predicate: (item: T) => boolean): Promise<boolean> {
    const data = await this.read();
    return data.some(predicate);
  }
}