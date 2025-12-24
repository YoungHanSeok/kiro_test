/**
 * 기본 리포지토리 인터페이스
 */

/**
 * 기본 CRUD 작업을 정의하는 리포지토리 인터페이스
 */
export interface BaseRepository<T, ID = string> {
  /**
   * ID로 단일 항목 조회
   */
  findById(id: ID): Promise<T | null>;

  /**
   * 모든 항목 조회
   */
  findAll(): Promise<T[]>;

  /**
   * 조건에 맞는 항목들 조회
   */
  findBy(predicate: (item: T) => boolean): Promise<T[]>;

  /**
   * 새 항목 생성
   */
  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * 기존 항목 업데이트
   */
  update(id: ID, updates: Partial<T>): Promise<T | null>;

  /**
   * 항목 삭제
   */
  delete(id: ID): Promise<boolean>;

  /**
   * 항목 존재 여부 확인
   */
  exists(id: ID): Promise<boolean>;

  /**
   * 전체 항목 수 조회
   */
  count(): Promise<number>;
}